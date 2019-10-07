""" DAL functions for findings """

from __future__ import absolute_import

import rollbar
import boto3
from botocore.exceptions import ClientError

# pylint:disable=relative-import
from __init__ import (
    FI_AWS_DYNAMODB_ACCESS_KEY, FI_AWS_DYNAMODB_SECRET_KEY, FI_AWS_S3_BUCKET
)
from app.dal.helpers import s3


DYNAMODB_RESOURCE = boto3.resource(
    service_name='dynamodb',
    aws_access_key_id=FI_AWS_DYNAMODB_ACCESS_KEY,
    aws_secret_access_key=FI_AWS_DYNAMODB_SECRET_KEY,
    region_name='us-east-1')
TABLE = DYNAMODB_RESOURCE.Table('FI_findings')


def create(analyst_email, finding_id, project_name, title, **kwargs):
    success = False
    try:
        finding = {
            'analyst': analyst_email,
            'cvss_version': '3',
            'exploitability': 0,
            'files': [],
            'finding': title,
            'finding_id': finding_id,
            'project_name': project_name,
        }
        finding.update(kwargs)
        response = TABLE.put_item(Item=finding)
        success = response['ResponseMetadata']['HTTPStatusCode'] == 200
    except ClientError as ex:
        rollbar.report_message('Error: Couldn\'nt create draft',
                               'error', extra_data=ex, payload_data=locals())
    return success


def update(finding_id, data):
    success = False
    try:
        attrs_to_remove = [attr for attr in data if data[attr] is None]
        for attr in attrs_to_remove:
            response = TABLE.update_item(
                Key={'finding_id': finding_id},
                UpdateExpression='REMOVE #attr',
                ExpressionAttributeNames={'#attr': attr}
            )
            success = response['ResponseMetadata']['HTTPStatusCode'] == 200
            del data[attr]

        if data:
            attributes = ['{attr} = :{attr}'.format(attr=attr) for attr in data]
            values = {':{}'.format(attr): data[attr] for attr in data}

            response = TABLE.update_item(
                Key={'finding_id': finding_id},
                UpdateExpression='SET {}'.format(','.join(attributes)),
                ExpressionAttributeValues=values)
            success = response['ResponseMetadata']['HTTPStatusCode'] == 200
    except ClientError as ex:
        rollbar.report_message('Error: Couldn\'nt update finding',
                               'error', extra_data=ex, payload_data=locals())

    return success


def delete(finding_id):
    success = False
    try:
        response = TABLE.delete_item(Key={'finding_id': finding_id})
        success = response['ResponseMetadata']['HTTPStatusCode'] == 200
    except ClientError as ex:
        rollbar.report_message('Error: Couldn\'nt delete finding',
                               'error', extra_data=ex, payload_data=locals())

    return success


def get_finding(finding_id):
    """ Retrieve all attributes from a finding """
    response = TABLE.get_item(Key={'finding_id': finding_id})

    return response.get('Item', {})


def save_evidence(file_object, file_name):
    success = s3.upload_memory_file(FI_AWS_S3_BUCKET, file_object, file_name)

    return success


def search_evidence(file_name):
    return s3.list_files(FI_AWS_S3_BUCKET, file_name)


def remove_evidence(file_name):
    return s3.remove_file(FI_AWS_S3_BUCKET, file_name)


def download_evidence(file_name, file_path):
    s3.download_file(FI_AWS_S3_BUCKET, file_name, file_path)
