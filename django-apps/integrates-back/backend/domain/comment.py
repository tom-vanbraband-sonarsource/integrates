
from typing import Any, Dict, List, Tuple
from datetime import datetime
from time import time

import pytz
from django.conf import settings

from backend.domain import user as user_domain

from backend import util
from backend.dal import comment as comment_dal, finding as finding_dal, vulnerability as vuln_dal


def _get_comments(comment_type: str, finding_id: str, user_role: str) -> List[Dict[str, str]]:
    comments = [fill_comment_data(user_role, comment)
                for comment in comment_dal.get_comments(comment_type, int(finding_id))]
    return comments


def get_comments(finding_id: str, user_role: str) -> List[Dict[str, str]]:
    comments = _get_comments('comment', finding_id, user_role)
    historic_verification = finding_dal.get_attributes(
        finding_id, ['historic_verification']).get('historic_verification', [])
    verified = [verification for verification in historic_verification
                if verification.get('status') == 'VERIFIED'
                and verification.get('vulns', [])]
    if verified:
        vulns = vuln_dal.get_vulnerabilities(finding_id)
        comments = [fill_vuln_info(comment, verification.get('vulns', []), vulns)
                    if comment.get('id') == verification.get('comment') else comment
                    for comment in comments
                    for verification in verified]

    return comments


def get_event_comments(finding_id: str, user_role: str) -> List[Dict[str, str]]:
    comments = _get_comments('event', finding_id, user_role)

    return comments


def get_fullname(user_role: str, data: Dict[str, str]) -> str:
    comment_user_name = 'Hacker'
    if not data.get('fullname'):
        comment_user_name = data['email']
    elif (user_role in ['admin', 'analyst'] or
          user_domain.get_data(data['email'], 'role') in ['customer', 'customeradmin']):
        comment_user_name = data['fullname']
    else:
        user_company = user_domain.get_data(data['email'], 'company')
        if user_company:
            comment_user_name = 'Hacker at ' + user_company.capitalize()
    return comment_user_name


def fill_vuln_info(comment: Dict[str, str], vulns_ids: List[str],
                   vulns: List[Dict[str, Any]]) -> Dict[str, str]:
    selected_vulns = [vuln.get('where') for vuln in vulns if vuln.get('UUID') in vulns_ids]
    wheres = ', '.join(selected_vulns)  # type: ignore
    comment['content'] = f'Regarding vulnerabilities {wheres}: ' + comment.get('content', '')

    return comment


def fill_comment_data(user_role: str, data: Dict[str, str]) -> Dict[str, Any]:
    fullname = get_fullname(user_role, data)
    return {
        'content': data['content'],
        'created': util.format_comment_date(data['created']),
        'email': data['email'],
        'fullname': fullname if fullname else data['email'],
        'id': int(data['user_id']),
        'modified': util.format_comment_date(data['modified']),
        'parent': int(data['parent'])}


def get_observations(finding_id: str, user_role: str) -> List[Dict[str, str]]:
    observations = _get_comments('observation', finding_id, user_role)

    return observations


def create(comment_type: str, content: str, element_id: str,
           parent: str, user_info: Dict[str, str]) -> Tuple[Any, bool]:
    tzn = pytz.timezone(settings.TIME_ZONE)  # type: ignore
    today = datetime.now(tz=tzn).today().strftime('%Y-%m-%d %H:%M:%S')
    comment_id = int(round(time() * 1000))
    comment_attributes = {
        'comment_type': comment_type,
        'content': content,
        'created': today,
        'email': user_info['user_email'],
        'finding_id': int(element_id),
        'fullname': str.join(
            ' ', [user_info['first_name'], user_info['last_name']]),
        'modified': today,
        'parent': int(parent)
    }
    success = comment_dal.create(comment_id, comment_attributes)

    return (comment_id if success else None, success)
