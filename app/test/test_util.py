from __future__ import absolute_import
import os
from datetime import datetime

from boto3 import client
from django.http import JsonResponse
from django.test import TestCase
from django.test import RequestFactory
from django.conf import settings
from django.contrib.sessions.middleware import SessionMiddleware
from jose import jwt
from __init__ import (
    FI_AWS_S3_ACCESS_KEY, FI_AWS_S3_SECRET_KEY, FI_AWS_S3_BUCKET
)
import json
from app.dal.finding import get_finding
from app.util import (
    response, is_name, is_numeric, ord_asc_by_criticidad, user_email_filter,
    assert_file_mime, has_release, get_last_vuln, validate_release_date,
    validate_future_releases, get_jwt_content, list_s3_objects, replace_all, 
    list_to_dict, camelcase_to_snakecase, is_valid_file_name, is_valid_format)


class UtilTests(TestCase):

    def test_response(self):
        data = 'this is data'
        message = 'this is a test'
        error = '500'
        test_data = response(data, message, error)
        expected_output = { 'data': 'this is data',
                            'message': 'this is a test',
                            'error': '500'}
        assert json.loads(test_data.content.decode('utf-8')) == expected_output

    def test_is_name(self):
        bad_names = ['', 'asd>;', 'asd asd']
        good_names = ['name', 'name1234']
        for name in bad_names:
            assert not is_name(name)
        for name in good_names:
            assert is_name(name)

    def test_is_numeric(self):
        bad_inputs = ['', '123a', 'aaaa', '123>']
        good_input = '123123'
        for data in bad_inputs:
            assert not is_numeric(data)
        assert is_numeric(good_input)

    def test_ord_asc_by_criticidad(self):
        sortable_data = [
            {'severityCvss': 40}, {'severityCvss': 13}, {'severityCvss': 20},
            {'severityCvss': 30}, {'severityCvss': 12}, {'severityCvss': 1},
            {'severityCvss': 54}
        ]
        test_data = ord_asc_by_criticidad(sortable_data)
        expected_output = [
            {'severityCvss': 54}, {'severityCvss': 40}, {'severityCvss': 30},
            {'severityCvss': 20}, {'severityCvss': 13}, {'severityCvss': 12},
            {'severityCvss': 1}]
        assert test_data == expected_output

    def test_user_email_filter(self):
        emails = ['test@test.com', 'test@fluidattacks.com', 'test2@test.test']
        fluid_user = 'test@fluidattacks.com'
        external_user = 'test@external.com'
        
        test_data = user_email_filter(emails, fluid_user)
        expected_output = emails
        assert test_data == expected_output

        test_data = user_email_filter(emails, external_user)
        expected_output = ['test@test.com', 'test2@test.test']
        assert test_data == expected_output

    def test_assert_file_mime(self):
        path = os.path.dirname(__file__)
        filename = os.path.join(path, 'mock/test-vulns.yaml')
        non_included_filename = os.path.join(path, 'mock/test.7z')
        allowed_mimes = ['text/plain']
        assert assert_file_mime(filename, allowed_mimes)
        assert not assert_file_mime(non_included_filename, allowed_mimes)

    def test_has_release(self):
        test_dict = {'releaseDate': 'date'}
        test_dict_with_no_release_date = {'noReleaseDate': 'date'}
        assert has_release(test_dict)
        assert not has_release(test_dict_with_no_release_date)

    def test_get_last_vuln(self):
        finding = get_finding('422286126')
        test_data = get_last_vuln(finding)
        expected_output = datetime(2018, 7, 9).date()
        assert test_data == expected_output

    def test_validate_release_date(self):
        finding = get_finding('422286126')
        assert validate_release_date(finding)

    def test_validate_future_releases(self):
        finding_released = get_finding('475041513')
        assert not validate_future_releases(finding_released)

    def test_get_jwt_content(self):
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
        test_data = get_jwt_content(request)
        expected_output = {
            u'company': u'unittest',
            u'user_role': u'admin',
            u'user_email': u'unittest'}
        assert test_data == expected_output

    def test_list_s3_objects(self):
        s3_client = client(
            service_name='s3',
            aws_access_key_id=FI_AWS_S3_ACCESS_KEY,
            aws_secret_access_key=FI_AWS_S3_SECRET_KEY)
        bucket = FI_AWS_S3_BUCKET
        key = 'oneshot'
        test_data = list_s3_objects(s3_client, bucket, key)
        assert isinstance(test_data, list)
        for item in test_data:
            assert key in item

    def test_replace_all(self):
        data = {'a': 'a', 'b': 'b', 'c': 'c'}
        text = 'replaced'
        test_data = replace_all(text, data)
        expected_output = 'replaced'
        assert test_data == expected_output

    def test_list_to_dict(self):
        keys = ['item', 'item2', 'item3']
        values = ['hi', 'this is a', 'item']
        test_data = list_to_dict(keys, values)
        expected_output = {'item': 'hi', 'item2': 'this is a', 'item3': 'item'}
        assert test_data == expected_output

    def test_camelcase_to_snakecase(self):
        camelcase_string = 'thisIsATest'
        test_data = camelcase_to_snakecase(camelcase_string)
        expected_output = 'this_is_a_test'
        assert test_data == expected_output

    def test_is_valid_file_name(self):
        name = 'test123.py'
        test_data = is_valid_file_name(name)
        expected_output = True
        assert test_data == expected_output

    def test_is_valid_format(self):
        date = '2019-03-30 00:00:00'
        test_data = is_valid_format(date)
        expected_output = True
        assert test_data == expected_output
