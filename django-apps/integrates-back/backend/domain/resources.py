"""Domain functions for resources."""


from collections import namedtuple
from typing import Any, Dict, List, cast
import base64
import datetime
import threading
import urllib.request
import urllib.parse
import urllib.error
import rollbar

from botocore import signers
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import asymmetric, hashes, serialization

from backend import util
from backend.dal import (
    project as project_dal, resources as resources_dal
)
from backend.exceptions import InvalidFileSize
from backend.mailer import send_mail_resources

from __init__ import (FI_CLOUDFRONT_ACCESS_KEY, FI_CLOUDFRONT_PRIVATE_KEY,
                      FI_CLOUDFRONT_RESOURCES_DOMAIN, FI_MAIL_RESOURCERS)


def rsa_signer(message: str) -> bool:
    private_key = serialization.load_pem_private_key(
        base64.b64decode(FI_CLOUDFRONT_PRIVATE_KEY),
        password=None,
        backend=default_backend()
    )
    return private_key.sign(message, asymmetric.padding.PKCS1v15(), hashes.SHA1())


def sign_url(domain: str, file_name: str, expire_mins: float) -> str:
    filename = urllib.parse.quote_plus(str(file_name))
    url = domain + "/" + filename
    key_id = FI_CLOUDFRONT_ACCESS_KEY
    now_time = datetime.datetime.utcnow()
    expire_date = now_time + datetime.timedelta(minutes=expire_mins)
    cloudfront_signer = signers.CloudFrontSigner(key_id, rsa_signer)
    signed_url = cloudfront_signer.generate_presigned_url(
        url, date_less_than=expire_date)
    return signed_url


def format_resource(
        resource_list: List[Dict[str, str]], resource_type: str) -> List[Dict[str, str]]:
    resource_description = []
    for resource_item in resource_list:
        if resource_type == 'repository':
            repo_url = resource_item.get('urlRepo')
            repo_branch = resource_item.get('branch')
            resource_text = 'Repository: {repository!s} Branch: {branch!s}'\
                            .format(repository=repo_url, branch=repo_branch)
        elif resource_type == 'environment':
            resource_text = resource_item.get('urlEnv', '')
        elif resource_type == 'file':
            resource_text = resource_item.get('fileName', '')
        resource_description.append({'resource_description': resource_text})
    return resource_description


def send_mail(project_name: str, user_email: str,
              resource_list: List[Any], action: str, resource_type: str):
    recipients = set(project_dal.list_project_managers(project_name))
    recipients.add(user_email)
    recipients.update(FI_MAIL_RESOURCERS.split(','))
    resource_description = format_resource(resource_list, resource_type)
    if resource_type == 'repository' and len(resource_list) > 1:
        resource_type = 'repositories'
    elif len(resource_list) > 1:
        resource_type = '{}s'.format(resource_type)
    else:
        # resource_type is the same
        pass
    context = {
        'project': project_name.lower(),
        'user_email': user_email,
        'action': action,
        'resource_type': resource_type,
        'resource_list': resource_description,
        'project_url':
            'https://fluidattacks.com/integrates/dashboard#!/project/{project!s}/resources'
        .format(project=project_name)
    }
    threading.Thread(name='Remove repositories email thread',
                     target=send_mail_resources,
                     args=(list(recipients), context,)).start()


def validate_file_size(uploaded_file: Any, file_size: int) -> bool:
    """Validate if uploaded file size is less than a given file size."""
    mib = 1048576
    if uploaded_file.size > file_size * mib:
        raise InvalidFileSize()
    return True


def create_file(files_data: List[Dict[str, Any]], uploaded_file: Any,
                project_name: str, user_email: str) -> bool:
    project_name = project_name.lower()
    json_data: List[resources_dal.ResourceType] = []
    for file_info in files_data:
        json_data.append({
            'fileName': file_info.get('fileName', ''),
            'description': file_info.get('description', ''),
            'uploadDate': str(datetime.datetime.now().replace(second=0, microsecond=0))[:-3],
            'uploader': user_email,
        })
    file_id = '{project}/{file_name}'.format(
        project=project_name,
        file_name=uploaded_file
    )
    try:
        file_size = 100
        validate_file_size(uploaded_file, file_size)
    except InvalidFileSize:
        rollbar.report_message('Error: \
File exceeds size limit', 'error')
    files = project_dal.get_attributes(project_name, ['files'])
    project_files = cast(List[Dict[str, str]], files.get('files'))
    if project_files:
        contains_repeated = [f.get('fileName')
                             for f in project_files
                             if f.get('fileName') == uploaded_file.name]
        if contains_repeated:
            rollbar.report_message('Error: \
File already exists', 'error')
    else:
        # Project doesn't have files
        pass
    if util.is_valid_file_name(uploaded_file):
        return (
            resources_dal.save_file(uploaded_file, file_id)
            and resources_dal.create(json_data, project_name, 'files'))
    return False


def remove_file(file_name: str, project_name: str) -> bool:
    project_name = project_name.lower()
    file_list = cast(List[Dict[str, str]], project_dal.get(project_name)[0]['files'])
    index = -1
    cont = 0
    while index < 0 and len(file_list) > cont:
        if file_list[cont]['fileName'] == file_name:
            index = cont
        else:
            index = -1
        cont += 1
    if index >= 0:
        file_url = '{project}/{file_name}'.format(
            project=project_name.lower(),
            file_name=file_name
        )
        return (
            resources_dal.remove_file(file_url)
            and resources_dal.remove(project_name, 'files', index))
    return False


def download_file(file_info: str, project_name: str) -> str:
    project_name = project_name.lower()
    file_url = project_name + "/" + file_info
    minutes_until_expire = 1.0 / 6
    return sign_url(FI_CLOUDFRONT_RESOURCES_DOMAIN,
                    file_url, minutes_until_expire)


def create_resource(res_data: List[Dict[str, Any]], project_name: str,
                    res_type: str, user_email: str) -> bool:
    project_name = project_name.lower()
    if res_type == 'repository':
        res_id = 'urlRepo'
        res_name = 'repositories'
    elif res_type == 'environment':
        res_id = 'urlEnv'
        res_name = 'environments'
    json_data: List[resources_dal.ResourceType] = []
    for res in res_data:
        if res_id in res:
            new_state = {
                'user': user_email,
                'date': util.format_comment_date(
                    datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')),
                'state': 'ACTIVE'
            }
            if res_type == 'repository':
                res_object: resources_dal.ResourceType = {
                    'urlRepo': res.get('urlRepo', ''),
                    'branch': res.get('branch', ''),
                    'protocol': res.get('protocol', ''),
                    'uploadDate': str(
                        datetime.datetime.now().replace(second=0, microsecond=0))[:-3],
                    'historic_state': [new_state],
                }
            elif res_type == 'environment':
                res_object = {
                    'urlEnv': res.get('urlEnv', ''),
                    'historic_state': [new_state],
                }
            json_data.append(res_object)
        else:
            rollbar.report_message('Error: \
An error occurred adding repository', 'error')
    return resources_dal.create(json_data, project_name, res_name)


def update_resource(
        res_data: Dict[str, Any], project_name: str, res_type: str, user_email: str) -> bool:
    project_name = project_name.lower()
    res_list: List[project_dal.ProjectType] = []
    if res_type == 'repository':
        resource_url = res_data.get('urlRepo')
        res_list = \
            cast(List[project_dal.ProjectType], project_dal.get(project_name)[0]['repositories'])
        res_id = 'urlRepo'
        res_name = 'repositories'
    elif res_type == 'environment':
        resource_url = res_data.get('urlEnv')
        res_list = \
            cast(List[project_dal.ProjectType], project_dal.get(project_name)[0]['environments'])
        res_id = 'urlEnv'
        res_name = 'environments'
    cont = 0
    while len(res_list) > cont:
        if res_id in res_list[cont] and res_list[cont][res_id] == resource_url:
            new_state = {
                'user': user_email,
                'date': util.format_comment_date(
                    datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')),
                'state': 'INACTIVE'
            }
            if 'historic_state' in res_list[cont]:
                historic_state = cast(List[Dict[str, str]], res_list[cont]['historic_state'])
                if not historic_state[-1]['state'] == 'ACTIVE':
                    new_state['state'] = 'ACTIVE'
                historic_state.append(new_state)
            else:
                historic_state = [new_state]
            res_list[cont]['historic_state'] = historic_state
            break
        cont += 1
    return resources_dal.update(res_list, project_name, res_name)


def mask(project_name: str) -> Any:
    project_name = project_name.lower()
    project = project_dal.get_attributes(project_name, ['environments', 'files', 'repositories'])
    Status = namedtuple(
        'Status',
        'are_files_removed files_result environments_result repositories_result'
    )
    are_files_removed = all([
        resources_dal.remove_file(file_name)
        for file_name in resources_dal.search_file(f'{project_name}/')])
    files_result = project_dal.update(project_name, {
        'files': [
            {'fileName': 'Masked', 'description': 'Masked', 'uploader': 'Masked'}
            for file_resource in project.get('files', [])
        ]
    })
    environments_result = project_dal.update(project_name, {
        'environments': [
            {'urlEnv': 'Masked'}
            for file_resource in project.get('environments', [])
        ]
    })
    repositories_result = project_dal.update(project_name, {
        'repositories': [
            {'protocol': 'Masked', 'urlRepo': 'Masked'}
            for file_resource in project.get('repositories', [])
        ]
    })
    success = Status(are_files_removed, files_result, environments_result, repositories_result)
    return success
