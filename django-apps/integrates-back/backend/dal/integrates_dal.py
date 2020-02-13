# pylint: disable=too-many-lines

from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
import rollbar

from backend import util

from backend.dal.helpers import dynamodb

DYNAMODB_RESOURCE = dynamodb.DYNAMODB_RESOURCE


def attribute_exists(table_name, primary_key, data):
    return get_table_attributes_dynamo(
        table_name, primary_key, data)


def add_finding_comment_dynamo(finding_id, email, comment_data):
    """ Add a comment in a finding. """
    table = DYNAMODB_RESOURCE.Table('FI_comments')
    try:
        payload = {
            'finding_id': finding_id,
            'email': email
        }
        payload.update(comment_data)
        response = table.put_item(
            Item=payload
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def remove_role_to_project_dynamo(project_name, user_email, role):
    """Remove user role in a project."""
    table = DYNAMODB_RESOURCE.Table('FI_projects')
    try:
        response = table.update_item(
            Key={
                'project_name': project_name.lower(),
            },
            UpdateExpression='DELETE #rol :val1',
            ExpressionAttributeNames={
                '#rol': role
            },
            ExpressionAttributeValues={
                ':val1': set([user_email])
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def weekly_report_dynamo(
        init_date, finish_date, registered_users, logged_users, companies):
    """ Save the number of registered and logged users weekly. """
    table = DYNAMODB_RESOURCE.Table('FI_weekly_report')
    try:
        response = table.put_item(
            Item={
                'init_date': init_date,
                'finish_date': finish_date,
                'registered_users': registered_users,
                'logged_users': logged_users,
                'companies': companies,
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def get_data_dynamo(table_name, primary_name_key, primary_key):
    """Get atributes data."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    primary_key = primary_key.lower()
    filter_key = primary_name_key
    filtering_exp = Key(filter_key).eq(primary_key)
    response = table.query(KeyConditionExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.query(
                KeyConditionExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def get_data_dynamo_filter(table_name, filter_exp='', data_attr=''):
    """Get atributes data."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    scan_attrs = {}
    if data_attr:
        scan_attrs['ProjectionExpression'] = data_attr
    else:
        # ProjectionExpression not especified
        pass
    if filter_exp:
        scan_attrs['FilterExpression'] = filter_exp

    response = table.scan(**scan_attrs)
    items = response['Items']
    while response.get('LastEvaluatedKey'):
        scan_attrs['ExclusiveStartKey'] = response['LastEvaluatedKey']
        response = table.scan(**scan_attrs)
        items += response['Items']

    return items


def get_table_attributes_dynamo(table_name, primary_key, data_attributes):
    """ Get a group of attributes of a table. """
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        response = table.get_item(
            Key=primary_key,
            AttributesToGet=data_attributes
        )
        items = response.get('Item')
    except ClientError:
        rollbar.report_exc_info()
        items = {}
    return items if items else {}


def get_project_attributes_dynamo(project_name, data_attributes):
    """ Get a group of attributes of a project. """

    return get_table_attributes_dynamo(
        'FI_projects', {'project_name': project_name}, data_attributes)


def get_findings_data_dynamo(filtering_exp, data_attr=''):
    """Get all the findings of a project."""
    table = DYNAMODB_RESOURCE.Table('FI_findings')
    if data_attr:
        response = table.scan(
            FilterExpression=filtering_exp,
            ProjectionExpression=data_attr)
        items = response['Items']
        while True:
            if response.get('LastEvaluatedKey'):
                response = table.scan(
                    FilterExpression=filtering_exp,
                    ProjectionExpression=data_attr,
                    ExclusiveStartKey=response['LastEvaluatedKey'])
                items += response['Items']
            else:
                break
    else:
        response = table.scan(
            FilterExpression=filtering_exp)
        items = response['Items']
        while response.get('LastEvaluatedKey'):
            response = table.scan(
                FilterExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
    return items


def get_projects_data_dynamo(filtering_exp='', data_attr=''):
    """Get project from Dynamodb"""
    table = DYNAMODB_RESOURCE.Table('FI_projects')
    scan_attrs = {}
    if filtering_exp:
        scan_attrs['FilterExpression'] = filtering_exp
    else:
        # FilterExpression not especified
        pass

    if data_attr:
        scan_attrs['ProjectionExpression'] = data_attr
    else:
        # ProjectionExpression not especified
        pass

    response = table.scan(**scan_attrs)
    items = response['Items']
    while response.get('LastEvaluatedKey'):
        scan_attrs['ExclusiveStartKey'] = response['LastEvaluatedKey']
        response = table.scan(**scan_attrs)
        items += response['Items']

    return items


def get_findings_released_dynamo(project, data_attr=''):
    """Get all the findings that has been released."""
    filter_key = 'project_name'
    project_name = project.lower()
    filtering_exp = Attr(filter_key).eq(project_name) & Attr('releaseDate').exists()
    if data_attr and 'releaseDate' not in data_attr:
        data_attr += ', releaseDate'
    else:
        # By default it return all the attributes
        pass
    findings = get_findings_data_dynamo(filtering_exp, data_attr)
    findings_released = [i for i in findings if util.validate_release_date(i)]
    return findings_released


def delete_item(table_name, primary_keys):
    """ Remove item """

    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        item = table.get_item(Key=primary_keys)
        resp = False
        if item.get('Item'):
            response = table.delete_item(Key=primary_keys)
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        else:
            # item not found
            pass
        return resp
    except ClientError:
        return False


def remove_attr_dynamo(table_name, primary_keys, attr_name):
    """ Remove given attribute """

    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        response = table.update_item(
            Key=primary_keys,
            UpdateExpression='REMOVE #attrName',
            ExpressionAttributeNames={
                '#attrName': attr_name
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def remove_set_element_dynamo(table_name, primary_keys, set_name, set_element):
    """Remove a element from a set."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        response = table.update_item(
            Key={
                primary_keys[0]: primary_keys[1].lower(),
            },
            UpdateExpression='DELETE #name :val1',
            ExpressionAttributeNames={
                '#name': set_name
            },
            ExpressionAttributeValues={
                ':val1': set([set_element])
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
    except ClientError:
        rollbar.report_exc_info()
        resp = False
    return resp


def add_set_element_dynamo(table_name, primary_keys, set_name, set_values):
    """Adding elements to a set."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    item = get_data_dynamo(table_name, primary_keys[0], primary_keys[1])
    if item:
        resp = update_set_element_dynamo(
            table_name, primary_keys, set_name, set_values)
    else:
        try:
            response = table.put_item(
                Item={
                    primary_keys[0]: primary_keys[1].lower(),
                    set_name: set(set_values)
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        except ClientError:
            rollbar.report_exc_info()
            resp = False
    return resp


def update_set_element_dynamo(table_name, primary_keys, set_name, set_values):
    """Updating elements in a set."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        response = table.update_item(
            Key={
                primary_keys[0]: primary_keys[1].lower(),
            },
            UpdateExpression='ADD #name :val1',
            ExpressionAttributeNames={
                '#name': set_name
            },
            ExpressionAttributeValues={
                ':val1': set(set_values)
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
    except ClientError:
        rollbar.report_exc_info()
        resp = False
    return resp
