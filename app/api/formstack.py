# -*- coding: utf-8 -*-
""" Functions to consume the Formstack API. """

from __future__ import absolute_import
import json
import requests
# pylint: disable=E0402
# Pylint doesn't recognize absolute imports beyond top level modules.
# pylint: disable=F0401
from __init__ import FI_FORMSTACK_TOKENS
from requests.exceptions import ConnectionError
from retrying import retry
from app.dto import remission
from django.views.decorators.cache import cache_control
import rollbar

requests.adapters.DEFAULT_RETRIES = 10


class FormstackAPI(object):
    """ Class to consume the Formstack API. """

    headers_config = {}
    SUBMISSION_URL = "https://www.formstack.com/api/v2/submission/:id.json"
    # Finding URL
    FN_URL = "https://www.formstack.com/api/v2/form/1998500/submission.json"
    # Project information URL
    IN_URL = "https://www.formstack.com/api/v2/form/2696665/submission.json"
    # Eventuality URL
    EV_URL = "https://www.formstack.com/api/v2/form/1886931/submission.json"
    # Close finding URL
    CL_URL = "https://www.formstack.com/api/v2/form/2264008/submission.json"

    def __init__(self):
        """ Constructor. """
        self.headers_config['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64) \
AppleWebKit/537.36 (KHTML, like Gecko) FLUIDIntegrates/1.0'
        self.TOKEN_LIST = FI_FORMSTACK_TOKENS.split(',')
        self.AVAILABLE_TOKENS = len(self.TOKEN_LIST)
        self.CURRENT_TOKEN = self.TOKEN_LIST[0]

    def requests_per_page(self, method, url, data=None):
        """Return the request from Formstack."""
        formstack_response = self.request(method, url, data)
        total_submissions = int(formstack_response["total"])
        while total_submissions > data['per_page']:
            data["page"] += 1
            next_page_submissions = self.request(
                method,
                url,
                data)
            formstack_response["submissions"].extend(
                next_page_submissions["submissions"])
            total_submissions -= data['per_page']
        return formstack_response

    def request(self, method, url, data=None):
        """Validate if a token is available."""
        formstack_request = self.execute_request(method, url, data)
        while formstack_request.status_code == 429 and \
                self.AVAILABLE_TOKENS > 0:
            if self.AVAILABLE_TOKENS < 3:
                message = 'Warning: There are only {} available formstack \
                tokens left for today.'.format(self.AVAILABLE_TOKENS)
                rollbar.report_message(message, 'warning')

            self.refresh_token()
            formstack_request = self.execute_request(method, url, data)
        return json.loads(formstack_request.text)

    @retry(retry_on_exception=ConnectionError, stop_max_attempt_number=5)
    def execute_request(self, method, url, data=None):
        """ Build the requests used to consult in Formstack. """
        executed_request = None
        try:
            if method != "GET":
                self.headers_config["cache-control"] = "no-cache"
                self.headers_config["content-type"] = \
                    "application/x-www-form-urlencoded"
                url += "?oauth_token=:token".replace(":token",
                                                     self.CURRENT_TOKEN)
            else:
                if not data:
                    data = {"oauth_token": self.CURRENT_TOKEN}
                else:
                    data["oauth_token"] = self.CURRENT_TOKEN
            executed_request = requests.request(
                method, url,
                data=data, headers=self.headers_config
            )
        # Formstack SSLError
        except requests.exceptions.SSLError:
            executed_request = None
        # Formstack Connection timeout
        except requests.exceptions.Timeout:
            executed_request = None
        # Fail token
        except requests.exceptions.HTTPError:
            executed_request = None
        # Fail connection
        except ConnectionError:
            executed_request = None
        # Fail json format
        except ValueError:
            executed_request = None
        # Fail json
        except TypeError:
            executed_request = None
        return executed_request

    def refresh_token(self):
        next_index = (self.TOKEN_LIST.index(self.CURRENT_TOKEN) + 1)
        self.AVAILABLE_TOKENS = \
            len(self.TOKEN_LIST) - self.TOKEN_LIST.index(self.CURRENT_TOKEN)
        self.CURRENT_TOKEN = self.TOKEN_LIST[next_index]

    def delete_submission(self, submission_id):
        """ Delete a submission by ID. """
        data = {'id': submission_id}
        url = self.SUBMISSION_URL.replace(":id", submission_id)
        return self.request("DELETE", url, data=data)

    def get_eventualities(self, project):
        """ Get the eventualities by project name. """
        search_field = "29042322"
        data = {'search_field_1': search_field,
                'search_value_1': project,
                'page': 1,
                'per_page': 50}
        return self.requests_per_page("GET", self.EV_URL, data=data)

    @cache_control(max_age=600)
    def get_submission(self, submission_id):
        """ Get a submission by ID. """
        url = self.SUBMISSION_URL.replace(":id", submission_id)
        return self.request("GET", url)

    @cache_control(max_age=600)
    def get_findings(self, project):
        """ Get the findings of a project. """
        search_field = "32201732"
        data = {'search_field_1': search_field,
                'search_value_1': project,
                'page': 1,
                'per_page': 50}
        return self.requests_per_page("GET", self.FN_URL, data=data)

    def get_project_info(self, project):
        """ Get the findings of a project by its name. """
        search_field = "52601266"
        data = {'search_field_1': search_field,
                'search_value_1': project,
                'page': 1,
                'per_page': 50}
        return self.requests_per_page("GET", self.IN_URL, data=data)

    def get_closings_by_id(self, submission_id):
        """ Get the closures of a finding by its ID """
        search_field = "39596063"
        data = {'search_field_1': search_field,
                'search_value_1': submission_id,
                'page': 1,
                'per_page': 50}
        return self.requests_per_page("GET", self.CL_URL, data=data)

    def get_remmisions(self, project):
        """ Get the remissions of a project by its name. """
        data = {'search_field_1': remission.PROJECT_FIELD_ID,
                'search_value_1': project,
                'page': 1,
                'per_page': 50}
        return self.requests_per_page("GET", remission.URL, data=data)

    def get_closings_by_project(self, project):
        """ Get the all closures of a project """
        search_field = "39596058"
        data = {'search_field_1': search_field,
                'search_value_1': project,
                'page': 1,
                'per_page': 50}
        return self.requests_per_page("GET", self.CL_URL, data=data)

    def update(self, request_id, data_dto):
        """ Update a record in formstack. """
        url = self.SUBMISSION_URL.replace(":id", request_id)
        return self.request("PUT", url, data=data_dto)
