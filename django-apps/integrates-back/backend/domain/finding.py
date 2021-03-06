import io
import re
import random
from datetime import datetime, timedelta
from decimal import Decimal
from time import time

from typing import Dict, List, Optional, Tuple, Union, cast
import pytz
import rollbar
from django.conf import settings
from django.core.files.base import ContentFile
from i18n import t
from magic import Magic

from backend.domain import (
    comment as comment_domain, user as user_domain, vulnerability as vuln_domain
)

from backend.mailer import send_comment_mail

from backend import util
from backend.exceptions import (
    AlreadyApproved, AlreadySubmitted, EvidenceNotFound,
    FindingNotFound, IncompleteDraft, InvalidDraftTitle, InvalidFileSize,
    InvalidFileStructure, InvalidFileType, NotSubmitted,
    NotVerificationRequested
)
from backend.utils import cvss, notifications, validations, findings as finding_utils

from backend.dal import (
    comment as comment_dal, finding as finding_dal,
    project as project_dal, vulnerability as vuln_dal
)
from backend.typing import (
    Comment as CommentType, Finding as FindingType, User as UserType
)


def remove_repeated(
        vulnerabilities: List[Dict[str, FindingType]]) -> List[Dict[str, Dict[str, str]]]:
    """Remove vulnerabilities that changes in the same day."""
    vuln_casted = []
    for vuln in vulnerabilities:
        for state in cast(List[Dict[str, str]], vuln['historic_state']):
            vuln_without_repeated = {}
            format_date = str(state.get('date', '')).split(' ')[0]
            vuln_without_repeated[format_date] = {str(vuln['UUID']): str(state.get('state', ''))}
            if state.get('approval_status') != 'PENDING':
                vuln_casted.append(vuln_without_repeated)
            else:
                # don't append pending's state to tracking
                pass
    return vuln_casted


def get_unique_dict(list_dict: List[Dict[str, Dict[str, str]]]) -> Dict[str, Dict[str, str]]:
    """Get unique dict."""
    unique_dict: Dict[str, Dict[str, str]] = {}
    for entry in list_dict:
        date = next(iter(entry))
        if not unique_dict.get(date):
            unique_dict[date] = {}
        vuln = next(iter(entry[date]))
        unique_dict[date][vuln] = entry[date][vuln]
    return unique_dict


def get_tracking_dict(unique_dict: Dict[str, Dict[str, str]]) -> Dict[str, Dict[str, str]]:
    """Get tracking dictionary."""
    sorted_dates = sorted(unique_dict.keys())
    tracking_dict = {}
    if sorted_dates:
        tracking_dict[sorted_dates[0]] = unique_dict[sorted_dates[0]]
        for date in range(1, len(sorted_dates)):
            prev_date = sorted_dates[date - 1]
            tracking_dict[sorted_dates[date]] = tracking_dict[prev_date].copy()
            actual_date_dict = list(unique_dict[sorted_dates[date]].items())
            for vuln, state in actual_date_dict:
                tracking_dict[sorted_dates[date]][vuln] = state
    return tracking_dict


def group_by_state(tracking_dict: Dict[str, Dict[str, str]]) -> Dict[str, Dict[str, int]]:
    """Group vulnerabilities by state."""
    tracking: Dict[str, Dict[str, int]] = {}
    for tracking_date, status in list(tracking_dict.items()):
        for vuln_state in list(status.values()):
            status_dict = \
                tracking.setdefault(tracking_date, {'open': 0, 'closed': 0})
            status_dict[vuln_state] += 1
    return tracking


def cast_tracking(tracking) -> List[Dict[str, int]]:
    """Cast tracking in accordance to schema."""
    cycle = 0
    tracking_casted = []
    for date, value in tracking:
        effectiveness = \
            int(round((int(value['closed']) / float((value['open'] +
                       value['closed']))) * 100))
        closing_cicle = {
            'cycle': cycle,
            'open': value['open'],
            'closed': value['closed'],
            'effectiveness': effectiveness,
            'date': date,
        }
        cycle += 1
        tracking_casted.append(closing_cicle)
    return tracking_casted


def filter_evidence_filename(evidence_files: List[Dict[str, str]], name: str) -> str:
    evidence_info = [evidence for evidence in evidence_files
                     if evidence['name'] == name]
    return evidence_info[0].get('file_url', '') if evidence_info else ''


def add_comment(user_email: str, comment_data: CommentType,
                finding_id: str, is_remediation_comment: bool) -> bool:
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    comment_data['created'] = current_time
    comment_data['modified'] = current_time

    if not is_remediation_comment:
        send_comment_mail(
            comment_data, 'finding', user_email, str(comment_data.get('comment_type')),
            get_finding(finding_id))
    user_data = user_domain.get(user_email)
    user_data['user_email'] = user_data.pop('email')
    return comment_domain.create(str(comment_data.get('comment_type')),
                                 str(comment_data.get('content')),
                                 finding_id,
                                 str(comment_data.get('parent')),
                                 user_data)[1]


def get_age_finding(act_finding: Dict[str, FindingType]) -> int:
    """Get days since the vulnerabilities was release"""
    today = datetime.now()
    release_date = str(act_finding['releaseDate']).split(' ')
    age = abs(datetime.strptime(release_date[0], '%Y-%m-%d') - today).days
    return age


def get_tracking_vulnerabilities(
        vulnerabilities: List[Dict[str, FindingType]]) -> List[Dict[str, int]]:
    """get tracking vulnerabilities dictionary"""
    vulns_filtered = [vuln for vuln in vulnerabilities
                      if cast(List[Dict[str, str]],
                              vuln['historic_state'])[-1].get('approval_status')
                      != 'PENDING' or vuln_domain.get_last_approved_status(
                          vuln)]

    vulns_filtered = [vuln for vuln in vulns_filtered
                      if vuln_domain.filter_deleted_status(vuln)]
    vuln_casted = remove_repeated(vulns_filtered)
    unique_dict = get_unique_dict(vuln_casted)
    tracking = get_tracking_dict(unique_dict)
    tracking_grouped = group_by_state(tracking)
    order_tracking = sorted(tracking_grouped.items())
    tracking_casted = cast_tracking(order_tracking)
    return tracking_casted


def verify_finding(
        finding_id: str, user_email: str, justification: str, user_fullname: str) -> bool:
    success = False
    finding = get_finding(finding_id)
    project_name = str(finding.get('projectName', ''))
    finding_name = str(finding.get('finding', ''))
    historic_verification = cast(
        List[Dict[str, Union[str, int, datetime]]], finding.get('historicVerification', [{}]))
    if historic_verification[-1].get('status') == 'REQUESTED' and\
       not historic_verification[-1].get('vulns', []):
        tzn = pytz.timezone(settings.TIME_ZONE)  # type: ignore
        today = datetime.now(tz=tzn).today().strftime('%Y-%m-%d %H:%M:%S')
        comment_id = int(round(time() * 1000))
        new_state: Dict[str, Union[str, int, datetime]] = {
            'date': today,
            'user': user_email,
            'status': 'VERIFIED',
            'comment': comment_id,
        }
        comment_data = {
            'user_id': comment_id,
            'comment_type': 'verification',
            'content': justification,
            'fullname': user_fullname,
            'parent': historic_verification[-1].get('comment', 0),
        }
        historic_verification.append(new_state)
        add_comment(
            user_email, comment_data, finding_id, is_remediation_comment=True)
        success = finding_dal.update(
            finding_id, {'historic_verification': historic_verification})

        if success:
            vuln_domain.update_vulnerabilities_date(user_email, finding_id)
            finding_utils.send_finding_verified_email(finding_id, finding_name, project_name)
            project_users = project_dal.get_users(project_name)
            notifications.notify_mobile(
                project_users,
                t('notifications.verified.title'),
                t('notifications.verified.content',
                    finding=finding_name, project=project_name.upper()))
        else:
            rollbar.report_message(
                'Error: An error occurred verifying the finding', 'error')
    else:
        raise NotVerificationRequested()

    return success


def handle_acceptation(finding_id: str, observations: str, user_mail: str, response: str) -> bool:
    new_state = {
        'acceptance_status': response,
        'treatment': 'ACCEPTED_UNDEFINED',
        'justification': observations,
        'user': user_mail,
    }
    historic_treatment = cast(
        List[Dict[str, str]], get_finding(finding_id).get('historicTreatment'))
    historic_treatment.append(new_state)
    if response == 'REJECTED':
        tzn = pytz.timezone(settings.TIME_ZONE)  # type: ignore
        today = datetime.now(tz=tzn).today().strftime('%Y-%m-%d %H:%M:%S')
        historic_treatment.append({'treatment': 'NEW', 'date': today})
    return finding_dal.update(finding_id, {'historic_treatment': historic_treatment})


def calc_risk_level(probability: float, severity: float) -> str:
    return str(round((probability / 100) * severity, 1))


def update_description(finding_id: str, updated_values: Dict[str, FindingType]) -> bool:
    for value in updated_values.values():
        validations.validate_field(cast(List[str], str(value)))
    updated_values['finding'] = updated_values.get('title')
    updated_values['vulnerability'] = updated_values.get('description')
    updated_values['effect_solution'] = updated_values.get('recommendation')
    updated_values['records_number'] = str(updated_values.get('records_number'))
    updated_values['id'] = finding_id
    del updated_values['title']
    del updated_values['description']
    del updated_values['recommendation']
    updated_values = {key: None if not value else value for key, value in updated_values.items()}
    updated_values = {util.camelcase_to_snakecase(k): updated_values.get(k)
                      for k in updated_values}

    if re.search(r'^[A-Z]+\.(H\.|S\.|SH\.)??[0-9]+\. .+', str(updated_values.get('finding', ''))):
        return finding_dal.update(finding_id, updated_values)

    raise InvalidDraftTitle()


def update_treatment_in_vuln(finding_id: str, updated_values: Dict[str, str]) -> bool:
    new_values = cast(Dict[str, FindingType], {
        'treatment': updated_values.get('treatment', ''),
        'treatment_justification': updated_values.get('justification'),
        'acceptance_date': updated_values.get('acceptance_date'),
    })
    if new_values['treatment'] == 'NEW':
        new_values['treatment_manager'] = None
    vulns = get_vulnerabilities(finding_id)
    resp = True
    for vuln in vulns:
        if 'treatment_manager' not in [vuln, new_values]:
            new_values['treatment_manager'] = vuln_domain.set_treatment_manager(
                str(new_values.get('treatment', '')),
                str(updated_values.get('user', '')),
                finding_dal.get_finding(finding_id),
                user_domain.get_data(str(updated_values.get('user')), 'role') == 'customeradmin',
                str(updated_values.get('user', ''))
            )
        result_update_treatment = \
            vuln_dal.update(finding_id, str(vuln.get('UUID', '')), new_values)
        if not result_update_treatment:
            resp = False
    return resp


def update_client_description(finding_id: str, updated_values: Dict[str, str],
                              user_mail: str, update) -> bool:
    for value in updated_values.values():
        validations.validate_field(cast(List[str], str(value)))
    success_treatment, success_external_bts = True, True
    if update.bts_changed:
        success_external_bts = finding_dal.update(
            finding_id,
            {'external_bts': updated_values['bts_url'] if updated_values['bts_url'] else None}
        )
    if update.treatment_changed:
        success_treatment = update_treatment(finding_id, updated_values, user_mail)
    return success_treatment and success_external_bts


def update_treatment(
        finding_id: str, updated_values: Dict[str, str], user_mail: str) -> bool:
    success = False
    tzn = pytz.timezone(settings.TIME_ZONE)  # type: ignore
    today = datetime.now(tz=tzn).today().strftime('%Y-%m-%d %H:%M:%S')
    finding = get_finding(finding_id)
    historic_treatment = cast(List[Dict[str, str]], finding.get('historicTreatment', []))
    if updated_values['treatment'] == 'ACCEPTED' and updated_values['acceptance_date'] == '-':
        updated_values['acceptance_date'] = \
            (datetime.now() + timedelta(days=180)).strftime('%Y-%m-%d %H:%M:%S')
    updated_values = util.update_treatment_values(updated_values)
    new_treatment = updated_values['treatment']
    new_state = {
        'date': today,
        'treatment': new_treatment
    }
    if user_mail:
        new_state['user'] = user_mail
    if new_treatment != 'NEW':
        new_state['justification'] = updated_values['justification']
        if new_treatment == 'ACCEPTED':
            new_state['acceptance_date'] = updated_values['acceptance_date']
        if new_treatment == 'ACCEPTED_UNDEFINED':
            new_state['acceptance_status'] = updated_values['acceptance_status']
    if historic_treatment:
        if compare_historic_treatments(historic_treatment[-1], new_state):
            historic_treatment.append(new_state)
    else:
        historic_treatment = [new_state]
    result_update_finding = finding_dal.update(
        finding_id,
        {'historic_treatment': historic_treatment}
    )
    result_update_vuln = update_treatment_in_vuln(finding_id, historic_treatment[-1])
    if result_update_finding and result_update_vuln:
        should_send_mail(finding, updated_values)
        success = True
    return success


def compare_historic_treatments(last_state: Dict[str, str], new_state: Dict[str, str]) -> bool:
    excluded_attrs = ['date', 'acceptance_date', 'acceptance_status']
    last_values = [value for key, value in last_state.items() if key not in excluded_attrs]
    new_values = [value for key, value in new_state.items() if key not in excluded_attrs]
    date_change = 'acceptance_date' in new_state and \
        'acceptance_date' in last_state and \
        last_state['acceptance_date'].split(' ')[0] != \
        new_state['acceptance_date'].split(' ')[0]
    return sorted(last_values) != sorted(new_values) or date_change


def should_send_mail(finding: Dict[str, FindingType], updated_values: Dict[str, str]):
    if updated_values['treatment'] == 'ACCEPTED':
        finding_utils.send_accepted_email(
            finding, str(updated_values.get('justification', '')))
    if updated_values['treatment'] == 'ACCEPTED_UNDEFINED':
        finding_utils.send_accepted_email(finding,
                                          'Treatment state approval is pending for finding '
                                          + str(finding.get('finding', '')))


def save_severity(finding: Dict[str, FindingType]) -> bool:
    """Organize severity metrics to save in dynamo."""
    cvss_version: str = str(finding.get('cvssVersion', ''))
    cvss_parameters = finding_utils.CVSS_PARAMETERS[cvss_version]
    if cvss_version == '3.1':
        severity_fields = ['attackVector', 'attackComplexity',
                           'privilegesRequired', 'userInteraction',
                           'severityScope', 'confidentialityImpact',
                           'integrityImpact', 'availabilityImpact',
                           'exploitability', 'remediationLevel',
                           'reportConfidence', 'confidentialityRequirement',
                           'integrityRequirement', 'availabilityRequirement',
                           'modifiedAttackVector', 'modifiedAttackComplexity',
                           'modifiedPrivilegesRequired', 'modifiedUserInteraction',
                           'modifiedSeverityScope', 'modifiedConfidentialityImpact',
                           'modifiedIntegrityImpact', 'modifiedAvailabilityImpact']
        severity: Dict[str, FindingType] = \
            {util.camelcase_to_snakecase(k): Decimal(str(finding.get(k)))
             for k in severity_fields}
        unformatted_severity = {k: float(str(finding.get(k))) for k in severity_fields}
        privileges = cvss.calculate_privileges(
            unformatted_severity['privilegesRequired'],
            unformatted_severity['severityScope'])
        unformatted_severity['privilegesRequired'] = privileges
        severity['privileges_required'] = \
            Decimal(privileges).quantize(Decimal('0.01'))
        modified_priviles = cvss.calculate_privileges(
            unformatted_severity['modifiedPrivilegesRequired'],
            unformatted_severity['modifiedSeverityScope'])
        unformatted_severity['modifiedPrivilegesRequired'] = modified_priviles
        severity['modified_privileges_required'] = \
            Decimal(modified_priviles).quantize(Decimal('0.01'))
    else:
        severity_fields = ['accessVector', 'accessComplexity',
                           'authentication', 'exploitability',
                           'confidentialityImpact', 'integrityImpact',
                           'availabilityImpact', 'resolutionLevel',
                           'confidenceLevel', 'collateralDamagePotential',
                           'findingDistribution', 'confidentialityRequirement',
                           'integrityRequirement', 'availabilityRequirement']
        severity = {util.camelcase_to_snakecase(k): Decimal(str(finding.get(k)))
                    for k in severity_fields}
        unformatted_severity = {k: float(str(finding.get(k))) for k in severity_fields}
    severity['cvss_basescore'] = cvss.calculate_cvss_basescore(
        unformatted_severity, cvss_parameters, cvss_version)
    severity['cvss_temporal'] = cvss.calculate_cvss_temporal(
        unformatted_severity, float(cast(Decimal, severity['cvss_basescore'])), cvss_version)
    severity['cvss_env'] = cvss.calculate_cvss_environment(
        unformatted_severity, cvss_parameters, cvss_version)
    severity['cvss_version'] = cvss_version
    response = finding_dal.update(str(finding.get('id', '')), severity)
    return response


def delete_comment(comment: CommentType) -> bool:
    """Delete comment."""
    if comment:
        response = comment_dal.delete(comment['finding_id'], comment['user_id'])
    else:
        response = True
    return response


def delete_all_comments(finding_id: str) -> bool:
    """Delete all comments of a finding."""
    all_comments = comment_dal.get_comments('comment', int(finding_id))
    comments_deleted = [delete_comment(i) for i in all_comments]
    util.invalidate_cache(finding_id)
    return all(comments_deleted)


def delete_all_evidences_s3(finding_id: str, project: str, context) -> bool:
    """Delete s3 evidences files."""
    evidences_list = finding_dal.search_evidence(project + '/' + finding_id)
    is_evidence_deleted = False
    if evidences_list:
        is_evidence_deleted_s3 = \
            list(map(finding_dal.remove_evidence, evidences_list))  # type: ignore
        is_evidence_deleted = any(is_evidence_deleted_s3)
    else:
        util.cloudwatch_log(
            context,
            'Info: Finding ' + finding_id + ' does not have evidences in s3')
        is_evidence_deleted = True
    return is_evidence_deleted


def reject_draft(draft_id: str, reviewer_email: str) -> bool:
    draft_data = get_finding(draft_id)
    history = cast(List[Dict[str, str]], draft_data.get('historicState', [{}]))
    status = history[-1].get('state')
    success = False

    if 'releaseDate' not in draft_data:
        if status == 'SUBMITTED':
            tzn = pytz.timezone(settings.TIME_ZONE)  # type: ignore
            today = datetime.now(tz=tzn).today()
            rejection_date = str(today.strftime('%Y-%m-%d %H:%M:%S'))
            history.append({
                'date': rejection_date,
                'analyst': reviewer_email,
                'state': 'REJECTED'
            })

            success = finding_dal.update(draft_id, {
                'release_date': None,
                'historic_state': history
            })
            if success:
                finding_utils.send_draft_reject_mail(
                    draft_id, str(draft_data.get('projectName', '')),
                    str(draft_data.get('analyst', '')), str(draft_data.get('finding', '')),
                    reviewer_email)
        else:
            raise NotSubmitted()
    else:
        raise AlreadyApproved()

    return success


def filter_deleted_findings(findings_ids: List[str]) -> List[str]:
    return [finding_id for finding_id in findings_ids
            if validate_finding(finding_id)]


def delete_finding(finding_id: str, project_name: str, justification: str, context) -> bool:
    finding_data = get_finding(finding_id)
    submission_history = cast(List[Dict[str, str]], finding_data.get('historicState', [{}]))
    success = False

    if submission_history[-1].get('state') != 'DELETED':
        tzn = pytz.timezone(settings.TIME_ZONE)  # type: ignore
        today = datetime.now(tz=tzn).today()
        delete_date = str(today.strftime('%Y-%m-%d %H:%M:%S'))
        submission_history.append({
            'state': 'DELETED',
            'date': delete_date,
            'justification': justification,
            'analyst': util.get_jwt_content(context)['user_email'],
        })
        success = finding_dal.update(finding_id, {
            'historic_state': submission_history
        })

        if success:
            justification_dict = {
                'DUPLICATED': 'It is duplicated',
                'FALSE_POSITIVE': 'It is a false positive',
                'NOT_REQUIRED': 'Finding not required',
            }
            finding_utils.send_finding_delete_mail(
                finding_id, str(finding_data.get('finding', '')), project_name,
                str(finding_data.get('analyst', '')), justification_dict[justification])

    return success


def approve_draft(draft_id: str, reviewer_email: str) -> Tuple[bool, datetime]:
    draft_data = get_finding(draft_id)
    submission_history = cast(List[Dict[str, str]], draft_data.get('historicState'))
    release_date: Union[str, Optional[datetime]] = None
    success = False

    if 'releaseDate' not in draft_data and \
       submission_history[-1].get('state') != 'DELETED':
        has_vulns = vuln_domain.list_vulnerabilities([draft_id])
        if has_vulns:
            if 'reportDate' in draft_data:
                tzn = pytz.timezone(settings.TIME_ZONE)  # type: ignore
                today = datetime.now(tz=tzn).today()
                release_date = str(today.strftime('%Y-%m-%d %H:%M:%S'))
                history = cast(List[Dict[str, str]], draft_data.get('historicState', [{}]))
                history.append({
                    'date': release_date,
                    'analyst': reviewer_email,
                    'state': 'APPROVED'
                })

                success = finding_dal.update(draft_id, {
                    'lastVulnerability': release_date,
                    'releaseDate': release_date,
                    'treatment': 'NEW',
                    'historic_state': history
                })
            else:
                raise NotSubmitted()
    else:
        raise AlreadyApproved()
    return success, cast(datetime, release_date)


def get_finding(finding_id: str) -> Dict[str, FindingType]:
    """Retrieves and formats finding attributes"""
    finding = finding_dal.get_finding(finding_id)
    if not finding or not validate_finding(finding=finding):
        raise FindingNotFound()

    return finding_utils.format_data(finding)


def get_vulnerabilities(finding_id: str) -> List[Dict[str, FindingType]]:
    return finding_dal.get_vulnerabilities(finding_id)


def get_project(finding_id: str) -> str:
    return str(finding_dal.get_attributes(finding_id, ['project_name']).get('project_name', ''))


def get_findings(finding_ids: List[str]) -> List[Dict[str, FindingType]]:
    """Retrieves all attributes for the requested findings"""
    findings = [get_finding(finding_id) for finding_id in finding_ids
                if validate_finding(finding_id=finding_id)]
    if not findings and finding_ids:
        raise FindingNotFound()
    return findings


def append_records_to_file(records: List[Dict[str, str]], new_file):
    header = records[0].keys()
    values = [list(v) for v in [record.values() for record in records]]
    new_file_records = new_file.read()
    new_file_header = new_file_records.decode('utf-8').split('\n')[0]
    new_file_records = r'\n'.join(new_file_records.decode('utf-8').split('\n')[1:])
    records_str = ''
    for record in values:
        records_str += repr(str(','.join(record)) + '\n').replace('\'', '')
    aux = records_str
    records_str = str(','.join(header)) + r'\n' + aux + str(new_file_records).replace('\'', '')
    if new_file_header != str(','.join(header)):
        raise InvalidFileStructure()

    buff = io.BytesIO(records_str.encode('utf-8').decode('unicode_escape').encode('utf-8'))
    content_file = ContentFile(buff.read())
    content_file.close()
    return content_file


def update_evidence(finding_id: str, evidence_type: str, file) -> bool:
    finding = get_finding(finding_id)
    files = cast(List[Dict[str, str]], finding.get('files', []))
    project_name = str(finding.get('projectName', ''))
    success = False

    if evidence_type == 'fileRecords':
        old_file_name: str = next((item['file_url']
                                   for item in files
                                   if item['name'] == 'fileRecords'), '')
        if old_file_name != '':
            old_records = finding_utils.get_records_from_file(
                project_name, finding_id, old_file_name)
            if old_records:
                file = append_records_to_file(cast(List[Dict[str, str]], old_records), file)
                file.open()

    try:
        mime = Magic(mime=True).from_buffer(file.file.getvalue())
        extension = {
            'image/gif': '.gif',
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'application/x-empty': '.exp',
            'text/x-python': '.exp',
            'text/csv': '.csv',
            'text/plain': '.txt'
        }[mime]
    except AttributeError:
        extension = ''
    evidence_id = f'{project_name}-{finding_id}-{evidence_type}{extension}'
    full_name = f'{project_name}/{finding_id}/{evidence_id}'

    if finding_dal.save_evidence(file, full_name):
        evidence: Union[Dict[str, str], list] = \
            next((item
                  for item in files
                  if item['name'] == evidence_type), [])
        if evidence:
            index = files.index(cast(Dict[str, str], evidence))
            success = finding_dal.update(
                finding_id, {f'files[{index}].file_url': evidence_id})
        else:
            success = finding_dal.list_append(
                finding_id,
                'files',
                [{'name': evidence_type, 'file_url': evidence_id}])

    return success


def update_evidence_description(finding_id: str, evidence_type: str, description: str) -> bool:
    finding = get_finding(finding_id)
    files = cast(List[Dict[str, str]], finding.get('files', []))
    success = False

    evidence: Union[Dict[str, str], list] = \
        next((item for item in files if item['name'] == evidence_type), [])
    if evidence:
        index = files.index(cast(Dict[str, str], evidence))
        success = finding_dal.update(
            finding_id, {f'files[{index}].description': description})
    else:
        raise EvidenceNotFound()

    return success


def remove_evidence(evidence_name: str, finding_id: str) -> bool:
    finding = get_finding(finding_id)
    project_name = finding['projectName']
    files = cast(List[Dict[str, str]], finding.get('files', []))
    success = False

    evidence: Union[Dict[str, str], str] = \
        next((item for item in files if item['name'] == evidence_name), '')
    evidence_id = str(cast(Dict[str, str], evidence).get('file_url', ''))
    full_name = f'{project_name}/{finding_id}/{evidence_id}'

    if finding_dal.remove_evidence(full_name):
        index = files.index(cast(Dict[str, str], evidence))
        del files[index]
        success = finding_dal.update(finding_id, {'files': files})

    return success


def create_draft(info, project_name: str, title: str, **kwargs) -> bool:
    last_fs_id = 550000000
    finding_id = str(random.randint(last_fs_id, 1000000000))
    tzn = pytz.timezone(settings.TIME_ZONE)  # type: ignore
    project_name = project_name.lower()
    today = datetime.now(tz=tzn).today()
    creation_date = today.strftime('%Y-%m-%d %H:%M:%S')
    user_data = cast(UserType, util.get_jwt_content(info.context))
    analyst_email = str(user_data.get('user_email', ''))
    submission_history = {'analyst': analyst_email,
                          'date': creation_date,
                          'state': 'CREATED'}
    if util.is_api_token(user_data):
        submission_history.update({
            'analyst': f'api-{analyst_email}',
            'origin': kwargs.get('origin', 'api')})

    if 'description' in kwargs:
        kwargs['vulnerability'] = kwargs['description']
        del kwargs['description']
    if 'recommendation' in kwargs:
        kwargs['effect_solution'] = kwargs['recommendation']
        del kwargs['recommendation']
    if 'type' in kwargs:
        kwargs['finding_type'] = kwargs['type']
        del kwargs['type']

    finding_attrs = kwargs.copy()
    finding_attrs.update({
        'analyst': analyst_email,
        'cvss_version': '3.1',
        'exploitability': 0,
        'files': [],
        'finding': title,
        'report_date': creation_date,
        'historic_state': [submission_history],
        'historic_treatment': [{'treatment': 'NEW',
                                'date': creation_date,
                                'user': analyst_email}]
    })

    if re.search(r'^[A-Z]+\.(H\.|S\.|SH\.)??[0-9]+\. .+', title):

        return finding_dal.create(finding_id, project_name, finding_attrs)
    raise InvalidDraftTitle()


def submit_draft(finding_id: str, analyst_email: str) -> bool:
    success = False
    finding = get_finding(finding_id)
    submission_history = cast(List[Dict[str, str]], finding.get('historicState'))

    if 'releaseDate' not in finding and \
       submission_history[-1].get('state') != 'DELETED':
        is_submitted = submission_history[-1].get('state') == 'SUBMITTED'
        if not is_submitted:
            finding_evidence = cast(Dict[str, Dict[str, str]], finding['evidence'])
            evidence_list = \
                cast(List[Dict[str, Dict[str, str]]],
                     [finding_evidence.get(ev_name)
                      for ev_name in finding_evidence])
            has_evidence = any([str(evidence.get('url', ''))
                                for evidence in evidence_list])
            has_severity = float(str(finding['severityCvss'])) > Decimal(0)
            has_vulns = vuln_domain.list_vulnerabilities([finding_id])

            if all([has_evidence, has_severity, has_vulns]):
                today = datetime.now(tz=pytz.timezone(settings.TIME_ZONE)).today()  # type: ignore
                report_date = today.strftime('%Y-%m-%d %H:%M:%S')
                history = cast(List[Dict[str, str]], finding.get('historicState', []))
                history.append({
                    'analyst': analyst_email,
                    'date': report_date,
                    'state': 'SUBMITTED'
                })

                success = finding_dal.update(finding_id, {
                    'report_date': report_date,
                    'historic_state': history
                })
                if success:
                    finding_utils.send_new_draft_mail(analyst_email,
                                                      finding_id,
                                                      str(finding.get('finding', '')),
                                                      str(finding.get('projectName', '')))
            else:
                required_fields = {
                    'evidence': has_evidence,
                    'severity': has_severity,
                    'vulnerabilities': has_vulns
                }
                raise IncompleteDraft([field for field in required_fields
                                       if not required_fields[field]])
        else:
            raise AlreadySubmitted()
    else:
        raise AlreadyApproved()

    return success


def mask_finding(finding_id: str) -> bool:
    finding = finding_dal.get_finding(finding_id)
    finding = finding_utils.format_data(finding)

    attrs_to_mask = [
        'affected_systems', 'attack_vector_desc', 'effect_solution',
        'related_findings', 'risk', 'threat', 'treatment',
        'treatment_manager', 'vulnerability'
    ]
    finding_result = finding_dal.update(finding_id, {
        attr: 'Masked' for attr in attrs_to_mask
    })

    evidence_prefix = '{}/{}'.format(finding['projectName'], finding_id)
    evidence_result = all([
        finding_dal.remove_evidence(file_name)
        for file_name in finding_dal.search_evidence(evidence_prefix)])
    finding_dal.update(finding_id, {
        'files': [
            {'file_url': 'Masked', 'name': 'Masked', 'description': 'Masked'}
            for _ in cast(List[Dict[str, str]], finding['evidence'])
        ]
    })

    comments = comment_dal.get_comments('comment', int(finding_id))
    comments_result = all([
        comment_dal.delete(comment['finding_id'], comment['user_id'])
        for comment in comments])

    vulns_result = all([
        vuln_domain.mask_vuln(finding_id, str(vuln['UUID']))
        for vuln in vuln_domain.get_vulnerabilities(finding_id)])

    success = all([
        finding_result, evidence_result, comments_result, vulns_result])
    util.invalidate_cache(finding_id)

    return success


def validate_evidence(evidence_id: str, file) -> bool:
    mib = 1048576
    success = False

    if evidence_id in ['animation', 'exploitation'] \
            or evidence_id.startswith('evidence'):
        allowed_mimes = ['image/gif', 'image/jpeg', 'image/png']
        if not util.assert_uploaded_file_mime(file, allowed_mimes):
            raise InvalidFileType()
        if file.size > 10 * mib:
            raise InvalidFileSize()
        success = True
    elif evidence_id == 'exploit':
        allowed_mimes = ['text/x-python', 'text/plain']
        if not util.assert_uploaded_file_mime(file, allowed_mimes):
            raise InvalidFileType()
        if file.size > 1 * mib:
            raise InvalidFileSize()
        success = True
    elif evidence_id == 'fileRecords':
        allowed_mimes = ['text/csv', 'text/plain']
        if not util.assert_uploaded_file_mime(file, allowed_mimes):
            raise InvalidFileType()
        if file.size > 1 * mib:
            raise InvalidFileSize()
        success = True

    return success


def validate_finding(
        finding_id: Union[str, int] = 0, finding: Dict[str, FindingType] = None) -> bool:
    """Validate if a finding is not deleted."""
    if not finding:
        finding = finding_dal.get_finding(str(finding_id))
    historic_state = cast(List[Dict[str, str]], finding.get('historic_state', [{}]))
    return historic_state[-1].get('state', '') != 'DELETED'
