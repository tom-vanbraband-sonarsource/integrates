# -*- coding: utf-8 -*-
"""Functions to connect to dynamodb database."""
from __future__ import absolute_import

from __init__ import (
    FI_AWS_DYNAMODB_ACCESS_KEY, FI_AWS_DYNAMODB_SECRET_KEY, FI_ENVIRONMENT,
    FI_DYNAMODB_HOST, FI_DYNAMODB_PORT
)

import boto3

RESOURCE_OPTIONS = {}
if FI_ENVIRONMENT == 'development':
    ENDPOINT_URL = 'http://{}:{}'.format(FI_DYNAMODB_HOST, FI_DYNAMODB_PORT)
    RESOURCE_OPTIONS = {
        'service_name': 'dynamodb',
        'endpoint_url': ENDPOINT_URL
    }
else:
    RESOURCE_OPTIONS = {
        'service_name': 'dynamodb',
        'aws_access_key_id': FI_AWS_DYNAMODB_ACCESS_KEY,
        'aws_secret_access_key': FI_AWS_DYNAMODB_SECRET_KEY,
        'region_name': 'us-east-1'
    }

DYNAMODB_RESOURCE = boto3.resource(**RESOURCE_OPTIONS)
