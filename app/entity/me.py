from __future__ import absolute_import
from datetime import datetime, timedelta

from django.conf import settings
from google.auth.transport import requests
from google.oauth2 import id_token
from graphene import ObjectType, Mutation, List, String, Boolean, Int
from graphql import GraphQLError
from jose import jwt
import rollbar

from app import util
from app.dal import integrates_dal
from app.decorators import require_login
from app.domain import user as user_domain
from app.entity.project import Project
from app.exceptions import InvalidExpirationTime
from app.services import get_user_role, is_customeradmin

from __init__ import FI_GOOGLE_OAUTH2_KEY_ANDROID, FI_GOOGLE_OAUTH2_KEY_IOS


class Me(ObjectType):
    access_token = Boolean()
    role = String(project_name=String(required=False))
    projects = List(Project)

    def __init__(self):
        super(Me, self).__init__()
        self.role = ''
        self.projects = []

    def resolve_role(self, info, project_name=None):
        jwt_content = util.get_jwt_content(info.context)
        role = get_user_role(jwt_content)
        if project_name and role == 'customer':
            email = jwt_content.get('user_email')
            role = 'customeradmin' if is_customeradmin(
                project_name, email) else 'customer'
        self.role = role

        return self.role

    def resolve_projects(self, info):
        jwt_content = util.get_jwt_content(info.context)
        user_email = jwt_content.get('user_email')
        for project in integrates_dal.get_projects_by_user(user_email):
            self.projects.append(
                Project(project_name=project[0], description=project[1])
            )

        return self.projects

    def resolve_access_token(self, info):
        jwt_content = util.get_jwt_content(info.context)
        user_email = jwt_content.get('user_email')
        access_token = user_domain.get_user_attributes(
            user_email, ['access_token'])
        self.access_token = bool(access_token)

        return self.access_token


class SignIn(Mutation):
    class Arguments(object):
        auth_token = String(required=True)
        provider = String(required=True)
        push_token = String(required=False)
    authorized = Boolean()
    session_jwt = String()
    success = Boolean()

    @staticmethod
    def mutate(_, info, auth_token, provider, push_token):
        authorized = False
        session_jwt = ''
        success = False

        if provider == 'google':
            try:
                user_info = id_token.verify_oauth2_token(
                    auth_token, requests.Request())

                if user_info['iss'] not in ['accounts.google.com',
                                            'https://accounts.google.com']:
                    rollbar.report_message(
                        'Error: Invalid oauth2 issuer',
                        'error', info.context, user_info['iss'])
                    raise GraphQLError('INVALID_AUTH_TOKEN')
                elif user_info['aud'] not in [FI_GOOGLE_OAUTH2_KEY_ANDROID,
                                              FI_GOOGLE_OAUTH2_KEY_IOS]:
                    rollbar.report_message(
                        'Error: Invalid oauth2 audience',
                        'error', info.context, user_info['aud'])
                    raise GraphQLError('INVALID_AUTH_TOKEN')
                else:
                    email = user_info['email']
                    authorized = user_domain.is_registered(email)
                    if push_token:
                        integrates_dal.add_set_element_dynamo(
                            'FI_users', ['email', email],
                            'devices_to_notify', [push_token])
                    session_jwt = jwt.encode(
                        {
                            'user_email': email,
                            'user_role': user_domain.get_role(email),
                            'company': user_domain.get_user_attributes(
                                email, ['company'])['company'],
                            'first_name': user_info['given_name'],
                            'last_name': user_info['family_name'],
                            'exp': datetime.utcnow() +
                            timedelta(seconds=settings.SESSION_COOKIE_AGE)
                        },
                        algorithm='HS512',
                        key=settings.JWT_SECRET,
                    )
                    success = True
            except ValueError:
                util.cloudwatch_log(
                    info.context,
                    'Security: Sign in attempt using invalid Google token')
                raise GraphQLError('INVALID_AUTH_TOKEN')
        else:
            rollbar.report_message(
                'Error: Unknown auth provider' + provider, 'error')
            raise GraphQLError('UNKNOWN_AUTH_PROVIDER')

        return SignIn(authorized, session_jwt, success)


class UpdateAccessToken(Mutation):
    class Arguments(object):
        expiration_time = Int(required=True)
    success = Boolean()
    session_jwt = String()

    @staticmethod
    @require_login
    def mutate(_, info, expiration_time):
        user_info = util.get_jwt_content(info.context)
        email = user_info['user_email']
        token_data = util.calculate_hash_token()
        session_jwt = ''
        success = False

        if util.is_valid_expiration_time(expiration_time):
            session_jwt = jwt.encode(
                {
                    'user_email': email,
                    'company': user_domain.get_user_attributes(
                        email, ['company'])['company'],
                    'first_name': user_info['first_name'],
                    'last_name': user_info['last_name'],
                    'jti': token_data['jti'],
                    'iat': datetime.utcnow(),
                    'exp': expiration_time
                },
                algorithm='HS512',
                key=settings.JWT_SECRET_API
            )

            success = user_domain.update_access_token(email, token_data)
            if success:
                util.cloudwatch_log(
                    info.context, '{email} update access token'.format(
                        email=user_info['user_email']))
            else:
                util.cloudwatch_log(
                    info.context, '{email} attempted to update access token'
                    .format(email=user_info['user_email']))
        else:
            util.cloudwatch_log(
                info.context, '{email} attempted to use expiration time \
                greater than six months or minor than current time'
                .format(email=user_info['user_email']))
            raise InvalidExpirationTime()

        return UpdateAccessToken(success, session_jwt)


class InvalidateAccessToken(Mutation):
    success = Boolean()

    @staticmethod
    @require_login
    def mutate(_, info):
        user_info = util.get_jwt_content(info.context)

        success = user_domain.remove_access_token(user_info['user_email'])
        if success:
            util.cloudwatch_log(
                info.context, '{email} invalidate access token'.format(
                    email=user_info['user_email']))
        else:
            util.cloudwatch_log(
                info.context, '{email} attempted to invalidate access token'
                .format(email=user_info['user_email']))

        return InvalidateAccessToken(success)
