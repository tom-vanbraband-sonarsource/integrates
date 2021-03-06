from ariadne import graphql, graphql_sync
from django.test import TestCase
from django.test.client import RequestFactory
from django.contrib.sessions.middleware import SessionMiddleware
from django.conf import settings
from jose import jwt
from backend.api.schema import SCHEMA


class UserTests(TestCase):

    async def test_get_user(self):
        """Check for user."""
        query = '''
            query {
                user(projectName: "unittesting",
                     userEmail: "continuoushacking@gmail.com") {
                    email
                    role
                    responsibility
                    phoneNumber
                    organization
                    firstLogin
                    lastLogin
                    listProjects
                }
            }
        '''
        data = {'query': query}
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
        _, result = await graphql(SCHEMA, data, context_value=request)
        assert 'errors' not in result
        assert 'user' in result['data']
        assert 'organization' in result['data']['user']
        assert 'responsibility' in result['data']['user']
        assert 'phoneNumber' in result['data']['user']

    def test_add_user(self):
        """Check for addUser mutation."""
        query = '''
            mutation {
                addUser(email: "test@test.com",
                        organization: "CustomerInc",
                        role: "customer",
                        phoneNumber: "3331112233") {
                    success
                    email
                }
            }
        '''
        data = {'query': query}
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
        _, result = graphql_sync(SCHEMA, data, context_value=request)
        assert 'errors' not in result
        assert 'addUser' in result['data']
        assert 'success' in result['data']['addUser']
        assert 'email' in result['data']['addUser']

    def test_grant_user_access(self):
        """Check for grantUserAccess mutation."""
        query = '''
            mutation {
                grantUserAccess (
                email: "test@test.test",
                organization: "test",
                phoneNumber: "3453453453"
                projectName: "unittesting",
                responsibility: "test",
                role: "customer") {
                success
                grantedUser {
                    email
                    role
                    responsibility
                    phoneNumber
                    organization
                    firstLogin
                    lastLogin
                }
                }
            }
        '''
        data = {'query': query}
        request = RequestFactory().get('/')
        middleware = SessionMiddleware()
        middleware.process_request(request)
        request.session.save()
        request.session['username'] = 'unittest'
        request.session['company'] = 'unittest'
        request.session['role'] = 'admin'
        request.COOKIES[settings.JWT_COOKIE_NAME] = jwt.encode(
            {
                'username': 'unittest',
                'company': 'unittest',
                'user_role': 'admin',
                'user_email': 'unittest'
            },
            algorithm='HS512',
            key=settings.JWT_SECRET,
        )
        _, result = graphql_sync(SCHEMA, data, context_value=request)
        assert 'errors' not in result
        assert 'success' in result['data']['grantUserAccess']
        assert 'grantedUser' in result['data']['grantUserAccess']
        assert 'email' in result['data']['grantUserAccess']['grantedUser']

    def test_remove_user_access(self):
        """Check for removeUserAccess mutation."""
        query = '''
            mutation {
              removeUserAccess (
                projectName: "unittesting"
                userEmail: "test@test.test"
                )
                {
                  removedEmail
                  success
                }
            }
        '''
        data = {'query': query}
        request = RequestFactory().get('/')
        middleware = SessionMiddleware()
        middleware.process_request(request)
        request.session.save()
        request.session['username'] = 'unittest'
        request.session['company'] = 'unittest'
        request.session['role'] = 'admin'
        request.COOKIES[settings.JWT_COOKIE_NAME] = jwt.encode(
            {
                'username': 'unittest',
                'company': 'unittest',
                'user_role': 'admin',
                'user_email': 'unittest'
            },
            algorithm='HS512',
            key=settings.JWT_SECRET,
        )
        _, result = graphql_sync(SCHEMA, data, context_value=request)
        assert 'errors' not in result
        assert 'success' in result['data']['removeUserAccess']
        assert 'removedEmail' in result['data']['removeUserAccess']

    def test_edit_user(self):
        """Check for editUser mutation."""
        query = '''
            mutation {
              editUser (
                email: "test@test.testedited",
                organization: "edited",
                phoneNumber: "17364735",
                projectName: "unittesting",
                responsibility: "edited",
                role: "customer") {
                  success
                }
            }
        '''
        data = {'query': query}
        request = RequestFactory().get('/')
        middleware = SessionMiddleware()
        middleware.process_request(request)
        request.session.save()
        request.session['username'] = 'unittest'
        request.session['company'] = 'unittest'
        request.session['role'] = 'admin'
        request.COOKIES[settings.JWT_COOKIE_NAME] = jwt.encode(
            {
                'username': 'unittest',
                'company': 'unittest',
                'user_role': 'admin',
                'user_email': 'unittest'
            },
            algorithm='HS512',
            key=settings.JWT_SECRET,
        )
        _, result = graphql_sync(SCHEMA, data, context_value=request)
        assert 'errors' not in result
        assert 'success' in result['data']['editUser']
