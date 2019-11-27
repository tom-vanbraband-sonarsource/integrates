import pytest

from django.test import TestCase
from django.test.client import RequestFactory
from django.contrib.sessions.middleware import SessionMiddleware
from django.conf import settings
from graphene.test import Client
from jose import jwt

from app.api.schema import SCHEMA


class MeTests(TestCase):

    def _get_result(self, query):
        testing_client = Client(SCHEMA)
        request = RequestFactory().get('/')
        middleware = SessionMiddleware()
        middleware.process_request(request)
        request.session.save()
        request.session['username'] = 'unittest'
        request.session['company'] = 'unittest'
        request.session['role'] = 'admin'
        request.COOKIES[settings.JWT_COOKIE_NAME] = jwt.encode(
            {
                'user_email': 'unittest',
                'user_role': 'admin',
                'company': 'unittest'
            },
            algorithm='HS512',
            key=settings.JWT_SECRET,
        )

        return testing_client.execute(query, context=request)

    def test_get_me(self):
        query = '''
            query {
              me {
                projects {
                          name
                          description
                }
              }
            }
        '''
        result = self._get_result(query)
        assert 'errors' not in result
        assert 'projects' in result['data']['me']

    def test_accept_legal(self):
        query = '''
            mutation {
              acceptLegal(remember: true){
                    success
              }
            }
        '''
        result = self._get_result(query)
        assert 'errors' not in result
        assert result['data']['acceptLegal']['success']
