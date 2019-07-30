""" GraphQL Entity for Formstack Findings """
# pylint: disable=no-self-use
# pylint: disable=super-init-not-called
from __future__ import absolute_import
from time import time

import rollbar
from graphql import GraphQLError
from graphene import String, Boolean, Int, Mutation, Field
from graphene.types.generic import GenericScalar

from app import util
from app.api.formstack import FormstackAPI
from app.dao import integrates_dao
from app.decorators import require_login, require_role, require_finding_access
from app.dto.finding import (
    FindingDTO, finding_vulnerabilities, has_migrated_evidence, get_project_name,
)
from app.domain.finding import (
    migrate_all_files, update_file_to_s3, remove_repeated,
    group_by_state, cast_tracking, get_dynamo_evidence,
    add_file_attribute, migrate_evidence_description,
    list_comments, add_comment, verify_finding,
    get_unique_dict, get_tracking_dict, request_verification,
    update_description, update_treatment, save_severity,
    get_exploit_from_file, get_records_from_file, reject_draft, delete_finding,
    approve_draft
)
from app.entity.types.finding import FindingType
from app.entity.vulnerability import Vulnerability


class Finding(FindingType): # noqa pylint: disable=too-many-instance-attributes
    """Formstack Finding Class."""

    # pylint: disable=too-many-statements
    def __init__(self, identifier):
        """Class constructor."""
        super(Finding, self).__init__()

        finding_id = str(identifier)
        resp = finding_vulnerabilities(finding_id)

        if resp:
            self.id = finding_id  # noqa pylint: disable=invalid-name
            self.project_name = resp.get('projectName')
            self.release_date = resp.get('releaseDate', '')
            vulnerabilities = integrates_dao.get_vulnerabilities_dynamo(finding_id)
            if vulnerabilities:
                self.vulnerabilities = [Vulnerability(vuln) for vuln in vulnerabilities]
                open_vulnerabilities = \
                    [vuln for vuln in self.vulnerabilities if vuln.current_state == 'open']
                self.open_vulnerabilities = len(open_vulnerabilities)
                closed_vulnerabilities = \
                    [vuln for vuln in self.vulnerabilities if vuln.current_state == 'closed']
                self.closed_vulnerabilities = len(closed_vulnerabilities)
                list_where = {vuln.where for vuln in open_vulnerabilities}
                self.where = u', '.join(list_where).encode('utf-8')
            else:
                vuln_info = \
                    {'finding_id': self.id, 'vuln_type': 'old',
                     'where': resp.get('where')}
                self.vulnerabilities = [Vulnerability(vuln_info)]
                self.where = ''

            if 'fileRecords' in resp.keys():
                self.records = get_records_from_file(self, resp['fileRecords'])
            else:
                self.records = {}

            self.exploit = resp.get('exploit', '')
            self.cvss_version = resp.get('cvssVersion', '')
            if self.cvss_version == '3':
                severity_fields = \
                    ['attackVector', 'attackComplexity',
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
            else:
                severity_fields = ['accessVector', 'accessComplexity',
                                   'authentication', 'exploitability',
                                   'confidentialityImpact', 'integrityImpact',
                                   'availabilityImpact', 'resolutionLevel',
                                   'confidenceLevel', 'collateralDamagePotential',
                                   'findingDistribution', 'confidentialityRequirement',
                                   'integrityRequirement', 'availabilityRequirement']
            self.severity = {k: resp.get(k) for k in severity_fields}

            self.evidence = {
                'animation': {'url': resp.get('animation', ''), 'description': ''},
                'evidence1':
                    {'url': resp.get('evidence_route_1', ''),
                     'description': resp.get('evidence_description_1', '')},
                'evidence2':
                    {'url': resp.get('evidence_route_2', ''),
                     'description': resp.get('evidence_description_2', '')},
                'evidence3':
                    {'url': resp.get('evidence_route_3', ''),
                     'description': resp.get('evidence_description_3', '')},
                'evidence4':
                    {'url': resp.get('evidence_route_4', ''),
                     'description': resp.get('evidence_description_4', '')},
                'evidence5':
                    {'url': resp.get('evidence_route_5', ''),
                     'description': resp.get('evidence_description_5', '')},
                'exploitation':
                    {'url': resp.get('exploitation', ''), 'description': ''},
            }
            self.report_level = resp.get('reportLevel', '')
            self.title = resp.get('finding', '')
            self.scenario = resp.get('scenario', '')
            self.actor = resp.get('actor', '')
            self.description = resp.get('vulnerability', '')
            self.requirements = resp.get('requirements', '')
            self.attack_vector_desc = resp.get('attackVectorDesc', '')
            self.threat = resp.get('threat', '')
            self.recommendation = resp.get('effectSolution', '')
            self.affected_systems = resp.get('affectedSystems', '')
            self.compromised_attributes = resp.get('records', '')
            self.compromised_records = int(resp.get('recordsNumber', '0'))
            self.cwe_url = resp.get('cwe', '')
            self.bts_url = resp.get('externalBts', '')
            self.treatment = resp.get('treatment', '')
            self.treatment_manager = resp.get('treatmentManager', '')
            self.treatment_justification = resp.get('treatmentJustification', '')
            self.client_code = resp.get('clientCode', '')
            self.client_project = resp.get('clientProject', '')
            self.probability = int(resp.get('probability', '0'))
            self.detailed_severity = int(resp.get('severity', '0'))
            self.risk = resp.get('risk', '')
            self.risk_level = resp.get('riskValue', '')
            self.ambit = resp.get('ambit', '')
            self.category = resp.get('category', '')
            self.state = resp.get('estado', '')
            self.type = resp.get('findingType', '')
            self.age = resp.get('edad', 0)
            self.last_vulnerability = resp.get('lastVulnerability', 0)
            self.is_exploitable = resp.get('exploitable', '') == 'Si'
            self.severity_score = resp.get('severityCvss', '')
            self.report_date = resp.get('reportDate', '')

    def resolve_id(self, info):
        """Resolve id attribute."""
        del info
        return self.id

    def resolve_project_name(self, info):
        """Resolve project_name attribute."""
        del info
        return self.project_name

    def resolve_vulnerabilities(self, info, vuln_type='', state=''):
        """Resolve vulnerabilities attribute."""
        del info
        vuln_filtered = self.vulnerabilities
        if vuln_type:
            vuln_filtered = [i for i in vuln_filtered if i.vuln_type == vuln_type]
        if state:
            vuln_filtered = [i for i in vuln_filtered if i.current_state == state]
        return vuln_filtered

    def resolve_open_vulnerabilities(self, info):
        """Resolve open vulnerabilities attribute."""
        del info
        return self.open_vulnerabilities

    def resolve_release_date(self, info):
        """Resolve release date attribute."""
        del info
        return self.release_date

    def resolve_closed_vulnerabilities(self, info):
        """Resolve closed vulnerabilities attribute."""
        del info
        return self.closed_vulnerabilities

    def resolve_tracking(self, info):
        """Resolve tracking attribute."""
        del info
        if (self.release_date and
            (self.open_vulnerabilities or
                self.closed_vulnerabilities)):
            vuln_casted = remove_repeated(self.vulnerabilities)
            unique_dict = get_unique_dict(vuln_casted)
            tracking = get_tracking_dict(unique_dict)
            tracking_grouped = group_by_state(tracking)
            order_tracking = sorted(tracking_grouped.items())
            tracking_casted = cast_tracking(order_tracking)
            self.tracking = tracking_casted
        else:
            self.tracking = []
        return self.tracking

    def resolve_records(self, info):
        """
        Resolve compromised records attribute

        Verifies if there are records in dynamo. if not, it gets them from
        formstack
        """
        del info

        formstack_records = self.records
        dynamo_evidence = integrates_dao.get_finding_attributes_dynamo(
            self.id, ['files'])
        if dynamo_evidence:
            file_info = [evidence for evidence in dynamo_evidence.get('files')
                         if evidence['name'] == 'fileRecords']
            if file_info:
                file_name = file_info[0]['file_url']
                self.records = get_records_from_file(self, file_name)
            else:
                self.records = formstack_records
        else:
            self.records = formstack_records

        return self.records

    def resolve_severity(self, info):
        """ Resolve severity values from Formstack """
        del info

        return self.severity

    def resolve_cvss_version(self, info):
        """ Resolve cvss version value from Formstack """
        del info

        return self.cvss_version

    def resolve_exploit(self, info):
        """
        Resolve exploit attribute

        Verifies if the exploit is in dynamo. if not, it gets the filename from formstack
        """
        del info

        dynamo_evidence = integrates_dao.get_finding_attributes_dynamo(self.id, ['files'])
        has_exploit_formstack = False
        if dynamo_evidence:
            file_info = [evidence for evidence in dynamo_evidence.get('files')
                         if evidence['name'] == 'exploit']
            if file_info:
                file_name = file_info[0].get('file_url')
                self.exploit = get_exploit_from_file(self, file_name)
            else:
                has_exploit_formstack = True
        else:
            has_exploit_formstack = True
        if has_exploit_formstack:
            formstack_exploit = \
                '' if self.exploit == '' else get_exploit_from_file(self, self.exploit)
            self.exploit = formstack_exploit
        else:
            # Finding does not have exploit in formstack
            pass

        return self.exploit

    def resolve_evidence(self, info):
        """
        Resolve evidence attribute

        Verifies if the evidence is in dynamo. if not, it gets the filenames from formstack
        """
        del info

        formstack_evidence = self.evidence
        dynamo_evidence = get_dynamo_evidence(self.id)
        evidence_names = ['animation', 'evidence1', 'evidence2', 'evidence3',
                          'evidence4', 'evidence5', 'exploitation']
        for evidence_name in evidence_names:
            dyn_url = dynamo_evidence[evidence_name]['url']
            fs_url = formstack_evidence[evidence_name]['url']
            self.evidence[evidence_name]['url'] = dyn_url if dyn_url else fs_url
        return self.evidence

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_comments(self, info):
        """ Resolve comments attribute """

        self.comments = list_comments(
            user_email=util.get_jwt_content(info.context)['user_email'],
            comment_type='comment,verification',
            finding_id=self.id
        )
        return self.comments

    @require_role(['analyst', 'admin'])
    def resolve_observations(self, info):
        """ Resolve observations attribute """
        self.observations = list_comments(
            user_email=util.get_jwt_content(info.context)['user_email'],
            comment_type='observation',
            finding_id=self.id
        )
        return self.observations

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_report_level(self, info):
        """ Resolve report_level attribute """
        del info
        return self.report_level

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_title(self, info):
        """ Resolve title attribute """
        del info
        return self.title

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_scenario(self, info):
        """ Resolve scenario attribute """
        del info
        return self.scenario

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_actor(self, info):
        """ Resolve actor attribute """
        del info
        return self.actor

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_description(self, info):
        """ Resolve description attribute """
        del info
        return self.description

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_requirements(self, info):
        """ Resolve requirements attribute """
        del info
        return self.requirements

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_attack_vector_desc(self, info):
        """ Resolve attack vector description attribute """
        del info
        return self.attack_vector_desc

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_threat(self, info):
        """ Resolve threat attribute """
        del info
        return self.threat

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_recommendation(self, info):
        """ Resolve recommendation attribute """
        del info
        return self.recommendation

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_affected_systems(self, info):
        """ Resolve affected_systems attribute """
        del info
        return self.affected_systems

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_compromised_attributes(self, info):
        """ Resolve compromised_attributes attribute """
        del info
        return self.compromised_attributes

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_compromised_records(self, info):
        """ Resolve compromised_records attribute """
        del info
        return self.compromised_records

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_cwe_url(self, info):
        """ Resolve cwe_url attribute """
        del info

        return self.cwe_url

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_bts_url(self, info):
        """ Resolve bts_url attribute """
        del info
        return self.bts_url

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_treatment(self, info):
        """ Resolve treatment attribute """
        del info
        return self.treatment

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_treatment_manager(self, info):
        """ Resolve treatment_manager attribute """
        del info
        return self.treatment_manager

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_treatment_justification(self, info):
        """ Resolve treatment_justification attribute """
        del info
        return self.treatment_justification

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_client_code(self, info):
        """ Resolve client_code attribute """
        del info
        return self.client_code

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_client_project(self, info):
        """ Resolve client_project attribute """
        del info
        return self.client_project

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_probability(self, info):
        """ Resolve probability attribute """
        del info
        return self.probability

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_detailed_severity(self, info):
        """ Resolve detailed_severity attribute """
        del info
        return self.detailed_severity

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_risk(self, info):
        """ Resolve risk attribute """
        del info
        return self.risk

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_risk_level(self, info):
        """ Resolve risk_level attribute """
        del info
        return self.risk_level

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_ambit(self, info):
        """ Resolve ambit attribute """
        del info
        return self.ambit

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_category(self, info):
        """ Resolve category attribute """
        del info
        return self.category

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_state(self, info):
        """ Resolve state attribute """
        del info
        return self.state

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_remediated(self, info):
        """ Resolve remediated attribute """
        del info
        remediations = integrates_dao.get_remediated_dynamo(int(self.id))
        self.remediated = remediations[-1]['remediated'] if remediations else False
        return self.remediated

    @require_role(['analyst', 'customer', 'admin'])
    def resolve_type(self, info):
        """ Resolve type attribute """
        del info
        return self.type

    def resolve_age(self, info):
        """ Resolve age attribute """
        del info
        return self.age

    def resolve_last_vulnerability(self, info):
        """ Resolve days since last report """
        del info
        last_vuln_date = util.calculate_datediff_since(self.last_vulnerability)
        self.last_vulnerability = last_vuln_date.days
        return self.last_vulnerability

    def resolve_is_exploitable(self, info):
        """ Resolve is_exploitable attribute """
        del info
        return self.is_exploitable

    def resolve_severity_score(self, info):
        """ Resolve precalculated severity score """
        del info
        dyn_score = integrates_dao.get_finding_attributes_dynamo(
            self.id, ['cvss_temporal']).get('cvss_temporal')
        fs_score = self.severity_score
        self.severity_score = dyn_score if dyn_score else fs_score
        return self.severity_score

    def resolve_report_date(self, info):
        """ Resolve report date """
        del info
        return self.report_date


class UpdateEvidence(Mutation):
    """ Update evidence files """

    class Arguments(object):
        finding_id = String(required=True)
        id = String(required=True)  # noqa pylint: disable=invalid-name
    success = Boolean()
    finding = Field(Finding)

    @require_login
    @require_role(['analyst', 'admin'])
    @require_finding_access
    def mutate(self, info, **parameters):
        success = False
        uploaded_file = info.context.FILES.get('document', '')
        project_name = get_project_name(parameters.get('finding_id')).lower()
        if util.assert_uploaded_file_mime(uploaded_file,
                                          ['image/gif',
                                           'image/png',
                                           'text/x-python',
                                           'text/x-objective-c',
                                           'text/x-c',
                                           'text/plain',
                                           'text/html']):
            if evidence_exceeds_size(uploaded_file, int(parameters.get('id'))):
                util.cloudwatch_log(info.context,
                                    'Security: Attempted to upload evidence file \
                                        heavier than allowed in {project} project'
                                        .format(project=project_name))
                raise GraphQLError('File exceeds the size limits')
            else:
                field_num = FindingDTO()
                fieldname = [
                    ['animation', field_num.ANIMATION],
                    ['exploitation', field_num.EXPLOTATION],
                    ['evidence_route_1', field_num.DOC_ACHV1],
                    ['evidence_route_2', field_num.DOC_ACHV2],
                    ['evidence_route_3', field_num.DOC_ACHV3],
                    ['evidence_route_4', field_num.DOC_ACHV4],
                    ['evidence_route_5', field_num.DOC_ACHV5],
                    ['exploit', field_num.EXPLOIT],
                    ['fileRecords', field_num.REG_FILE]
                ]
                file_id = '{project}/{finding_id}/{project}-{finding_id}'.format(
                    project=project_name,
                    finding_id=parameters.get('finding_id')
                )
                migrate_all_files(parameters, file_id)
                success = update_file_to_s3(parameters,
                                            fieldname[int(parameters.get('id'))][1],
                                            fieldname[int(parameters.get('id'))][0],
                                            uploaded_file, file_id)
        else:
            util.cloudwatch_log(info.context,
                                'Security: Attempted to upload evidence file with a \
                                    non-allowed format in {project} project'
                                    .format(project=project_name))
            raise GraphQLError('Extension not allowed')
        ret = UpdateEvidence(success=success,
                             finding=Finding(parameters.get('finding_id')))
        util.invalidate_cache(parameters.get('finding_id'))
        return ret


class UpdateEvidenceDescription(Mutation):
    """ Update evidence description """

    class Arguments(object):
        description = String(required=True)
        finding_id = String(required=True)
        field = String(required=True)
    success = Boolean()
    finding = Field(Finding)

    @require_login
    @require_role(['analyst', 'admin'])
    @require_finding_access
    def mutate(self, info, finding_id, field, description):
        success = False
        try:
            description_parse = {
                'evidence2_description': 'evidence_route_1',
                'evidence3_description': 'evidence_route_2',
                'evidence4_description': 'evidence_route_3',
                'evidence5_description': 'evidence_route_4',
                'evidence6_description': 'evidence_route_5',
            }
            has_migrated_description = has_migrated_evidence(finding_id)
            if not has_migrated_description:
                generic_dto = FindingDTO()
                api = FormstackAPI()
                submission_data = api.get_submission(finding_id)
                if submission_data is None or 'error' in submission_data:
                    return util.response([], 'error', True)
                else:
                    finding = generic_dto.parse_evidence_info(submission_data, finding_id)
                    finding['id'] = finding_id
                    migrate_evidence_description(finding)
            success = add_file_attribute(
                finding_id,
                description_parse[field],
                'description',
                description)
            if success:
                util.cloudwatch_log(info.context, 'Security: Evidence description \
                    succesfully updated in finding ' + finding_id)
            else:
                util.cloudwatch_log(info.context, 'Security: Attempted to update \
                    evidence description in ' + finding_id)
        except KeyError:
            rollbar.report_message('Error: \
An error occurred updating evidence description', 'error', info.context)

        ret = \
            UpdateEvidenceDescription(success=success,
                                      finding=Finding(finding_id))
        util.invalidate_cache(finding_id)
        return ret


def evidence_exceeds_size(uploaded_file, evidence_type):
    animation = 0
    exploitation = 1
    evidence = [2, 3, 4, 5, 6]
    exploit = 7
    records = 8
    mib = 1048576
    if evidence_type == animation:
        return uploaded_file.size > 10 * mib
    elif evidence_type == exploitation:
        return uploaded_file.size > 2 * mib
    elif evidence_type in evidence:
        return uploaded_file.size > 2 * mib
    elif evidence_type == exploit:
        return uploaded_file.size > 1 * mib
    elif evidence_type == records:
        return uploaded_file.size > 1 * mib
    else:
        util.cloudwatch_log_plain('Security: \
Attempted to upload an unknown type of evidence')
        raise Exception('Invalid evidence id')


class UpdateSeverity(Mutation):
    class Arguments(object):
        finding_id = String(required=True)
        data = GenericScalar(required=True)
    success = Boolean()
    finding = Field(Finding)

    @require_login
    @require_role(['analyst', 'admin'])
    @require_finding_access
    def mutate(self, info, **parameters):
        finding_id = parameters.get('finding_id')
        project = integrates_dao.get_finding_project(finding_id)
        success = False
        success = save_severity(parameters.get('data'))
        ret = UpdateSeverity(success=success,
                             finding=Finding(finding_id))
        util.invalidate_cache(finding_id)
        util.invalidate_cache(project)
        if success:
            util.cloudwatch_log(info.context, 'Security: Updated severity in\
                finding {id} succesfully'.format(id=parameters.get('finding_id')))
        else:
            util.cloudwatch_log(info.context, 'Security: Attempted to update \
                severity in finding {id}'.format(id=parameters.get('finding_id')))
        return ret


class AddFindingComment(Mutation):
    """ Add comment to finding """
    class Arguments(object):
        content = String(required=True)
        finding_id = String(required=True)
        parent = String(required=True)
        type = String(required=True)
    success = Boolean()
    comment_id = String()

    @require_login
    @require_role(['analyst', 'customer', 'admin'])
    @require_finding_access
    def mutate(self, info, **parameters):
        if parameters.get('type') in ['comment', 'observation']:
            user_data = util.get_jwt_content(info.context)
            if parameters.get('type') == 'observation' and user_data['user_role'] not in \
                                                                    ['analyst', 'admin']:
                util.cloudwatch_log(info.context, 'Security: \
                    Unauthorized role attempted to add observation')
                raise GraphQLError('Access denied')

            user_email = user_data['user_email']
            comment_id = int(round(time() * 1000))
            comment_data = {
                'user_id': comment_id,
                'comment_type': parameters.get('type'),
                'content': parameters.get('content'),
                'fullname': str.join(' ', [info.context.session['first_name'],
                                     info.context.session['last_name']]),
                'parent': int(parameters.get('parent')),
            }
            success = add_comment(
                user_email=user_email,
                comment_data=comment_data,
                finding_id=parameters.get('finding_id'),
                is_remediation_comment=False
            )
        else:
            raise GraphQLError('Invalid comment type')
        if success:
            util.cloudwatch_log(info.context, 'Security: Added comment in\
                finding {id} succesfully'.format(id=parameters.get('finding_id')))
        else:
            util.cloudwatch_log(info.context, 'Security: Attempted to add \
                comment in finding {id}'.format(id=parameters.get('finding_id')))
        ret = AddFindingComment(success=success, comment_id=comment_id)
        util.invalidate_cache(parameters.get('finding_id'))
        return ret


class VerifyFinding(Mutation):
    """ Verify a finding """
    class Arguments(object):
        finding_id = String(required=True)
    success = Boolean()

    @require_login
    @require_role(['analyst', 'admin'])
    @require_finding_access
    def mutate(self, info, **parameters):
        user_email = util.get_jwt_content(info.context)['user_email']
        success = verify_finding(
            finding_id=parameters.get('finding_id'),
            user_email=user_email
        )
        util.cloudwatch_log(info.context, 'Security: Verified the finding_id:\
            {id}'.format(id=parameters.get('finding_id')))
        ret = VerifyFinding(success=success)
        util.invalidate_cache(parameters.get('finding_id'))
        return ret


class RequestVerification(Mutation):
    """ Request verification """
    class Arguments(object):
        finding_id = String(required=True)
        justification = String(required=True)
    success = Boolean()

    @require_login
    @require_role(['customer', 'admin'])
    @require_finding_access
    def mutate(self, info, finding_id, justification):
        user_email = util.get_jwt_content(info.context)['user_email']
        success = request_verification(
            finding_id=finding_id,
            user_email=user_email,
            user_fullname=str.join(' ',
                                   [info.context.session['first_name'],
                                    info.context.session['last_name']]),
            justification=justification
        )
        util.cloudwatch_log(info.context, 'Security: Verified a request in finding_id:\
            {id}'.format(id=finding_id))
        ret = RequestVerification(success=success)
        util.invalidate_cache(finding_id)
        return ret


class UpdateDescription(Mutation):
    """ Update description of a finding """
    class Arguments(object):
        actor = String(required=True)
        affected_systems = String(required=True)
        attack_vector_desc = String(required=True)
        ambit = String()
        category = String()
        client_code = String()
        client_project = String()
        cwe = String(required=True)
        description = String(required=True)
        finding_id = String(required=True)
        probability = Int()
        recommendation = String(required=True)
        records = String()
        records_number = Int(required=True)
        report_level = String(required=True)
        requirements = String(required=True)
        risk = String()
        severity = Int()
        scenario = String(required=True)
        threat = String(required=True)
        title = String(required=True)
        finding_type = String()
    success = Boolean()
    finding = Field(Finding)

    @require_login
    @require_role(['analyst', 'admin'])
    @require_finding_access
    def mutate(self, info, finding_id, **parameters):
        success = update_description(finding_id, parameters)
        if success:
            util.cloudwatch_log(info.context, 'Security: Updated description in\
                finding {id} succesfully'.format(id=finding_id))
        else:
            util.cloudwatch_log(info.context, 'Security: Attempted to update \
                description in finding {id}'.format(id=finding_id))
        ret = \
            UpdateDescription(success=success,
                              finding=Finding(finding_id))
        project_name = get_project_name(finding_id)
        util.invalidate_cache(finding_id)
        util.invalidate_cache(project_name)
        return ret


class UpdateTreatment(Mutation):
    """ Update treatment of a finding """
    class Arguments(object):
        bts_url = String()
        finding_id = String(required=True)
        treatment = String(required=True)
        treatment_manager = String()
        treatment_justification = String(required=True)
    success = Boolean()
    finding = Field(Finding)

    @require_login
    @require_role(['customer', 'admin'])
    @require_finding_access
    def mutate(self, info, finding_id, **parameters):
        user_email = util.get_jwt_content(info.context)['user_email']
        project_name = get_project_name(finding_id)
        treatment_state = \
            integrates_dao.get_finding_attributes_dynamo(finding_id, ['treatment'])
        if treatment_state and \
                parameters['treatment'] != treatment_state.get('treatment'):
            remediations = integrates_dao.get_remediated_dynamo(int(finding_id))
            if remediations and remediations[-1]['remediated']:
                raise GraphQLError('Verification process')
            else:
                # request verified or there isn't a request verification
                pass
        else:
            # finding treatment isn't changed
            pass
        if parameters['treatment'] == 'IN PROGRESS':
            if parameters.get('treatment_manager'):
                project_users = [user[0]
                                 for user in integrates_dao.get_project_users(project_name)
                                 if user[1] == 1]
                customer_roles = ["customer", "customeradmin"]
                customer_users = [user
                                  for user in project_users
                                  if integrates_dao.get_role_dao(user) in customer_roles]
                if parameters.get('treatment_manager') not in customer_users:
                    raise GraphQLError('Invalid treatment manager')
            else:
                raise GraphQLError('Invalid treatment manager')
        elif parameters['treatment'] == 'ACCEPTED':
            parameters['treatment_manager'] = user_email
        success = update_treatment(finding_id, parameters, user_email)
        if success:
            util.cloudwatch_log(info.context, 'Security: Updated treatment in\
                finding {id} succesfully'.format(id=finding_id))
        else:
            util.cloudwatch_log(info.context, 'Security: Attempted to update \
                treatment in finding {id}'.format(id=finding_id))
        ret = UpdateTreatment(success=success,
                              finding=Finding(finding_id))
        util.invalidate_cache(finding_id)
        util.invalidate_cache(project_name)
        return ret


class DeleteDraft(Mutation):
    class Arguments(object):
        finding_id = String(required=True)
    success = Boolean()

    @require_login
    @require_role(['admin', 'analyst'])
    @require_finding_access
    def mutate(self, info, finding_id):
        reviewer_email = util.get_jwt_content(info.context)['user_email']
        try:
            project_name = get_project_name(finding_id)
            success = reject_draft(finding_id, reviewer_email, project_name)
            util.invalidate_cache(finding_id)
            util.invalidate_cache(project_name)
        except KeyError:
            raise GraphQLError('DRAFT_NOT_FOUND')
        if success:
            util.cloudwatch_log(info.context, 'Security: Deleted draft in\
                finding {id} succesfully'.format(id=finding_id))
        else:
            util.cloudwatch_log(info.context, 'Security: Attempted to delete \
                draft in finding {id}'.format(id=finding_id))
        return DeleteDraft(success=success)


class DeleteFinding(Mutation):
    class Arguments(object):
        finding_id = String(required=True)
        justification = String(required=True)
    success = Boolean()

    @require_login
    @require_role(['admin', 'analyst'])
    @require_finding_access
    def mutate(self, info, finding_id, justification):
        try:
            project_name = get_project_name(finding_id)
            success = delete_finding(finding_id, project_name, justification)
            util.invalidate_cache(finding_id)
            util.invalidate_cache(project_name)
        except KeyError:
            raise GraphQLError('FINDING_NOT_FOUND')
        if success:
            util.cloudwatch_log(info.context, 'Security: Deleted finding: {id}\
                succesfully'.format(id=finding_id))
        else:
            util.cloudwatch_log(info.context, 'Security: Attempted to delete \
                finding: {id}'.format(id=finding_id))
        return DeleteFinding(success=success)


class ApproveDraft(Mutation):
    class Arguments(object):
        draft_id = String(required=True)
    release_date = String()
    success = Boolean()

    @require_login
    @require_role(['admin'])
    def mutate(self, info, draft_id):
        try:
            project_name = get_project_name(draft_id)
            success, release_date = approve_draft(draft_id, project_name)
            util.invalidate_cache(draft_id)
            util.invalidate_cache(project_name)
        except KeyError:
            raise GraphQLError('DRAFT_NOT_FOUND')
        if success:
            util.cloudwatch_log(info.context, 'Security: Approved draft in\
                {project} project succesfully'.format(project=project_name))
        else:
            util.cloudwatch_log(info.context, 'Security: Attempted to approve \
                draft in {project} project'.format(project=project_name))
        return ApproveDraft(release_date, success)
