""" GraphQL Entity for Findings """
# pylint: disable=no-self-use
from time import time

import rollbar
from graphql import GraphQLError
from graphene import (
    Argument, Boolean, Enum, Field, Float, Int, JSONString, List, Mutation,
    ObjectType, String
)
from graphene.types.generic import GenericScalar

from app import util
from app.dal import integrates_dal
from app.decorators import (
    get_entity_cache, require_finding_access, require_login, require_role,
    require_project_access
)
from app.domain import (
    comment as comment_domain, finding as finding_domain,
    vulnerability as vuln_domain
)
from app.domain.user import get_role
from app.dto.finding import FindingDTO, get_project_name
from app.entity.vulnerability import Vulnerability
from app.services import get_user_role, is_customeradmin
from app.utils import findings as finding_utils


class Finding(ObjectType):  # noqa pylint: disable=too-many-instance-attributes
    """Finding Class."""

    acceptance_date = String()
    actor = String()
    affected_systems = String()
    age = Int()
    ambit = String()
    analyst = String()
    attack_vector_desc = String()
    bts_url = String()
    category = String()
    client_code = String()
    client_project = String()
    closed_vulnerabilities = Int()
    comments = List(GenericScalar)
    compromised_attributes = String()
    compromised_records = Int()
    cvss_version = String()
    cwe_url = String()
    description = String()
    detailed_severity = Int()
    evidence = GenericScalar()
    exploit = String()
    id = String()  # noqa pylint: disable=invalid-name
    is_exploitable = Boolean()
    last_vulnerability = Int()
    observations = List(GenericScalar)
    open_vulnerabilities = Int()
    probability = Int()
    project_name = String()
    recommendation = String()
    records = JSONString()
    release_date = String()
    remediated = Boolean()
    report_date = String()
    report_level = String()
    requirements = String()
    risk = String()
    risk_level = String()
    scenario = String()
    severity = GenericScalar()
    severity_score = Float()
    state = String()
    threat = String()
    title = String()
    tracking = List(GenericScalar)
    treatment = String()
    treatment_justification = String()
    treatment_manager = String()
    type = String()
    vulnerabilities = List(Vulnerability, vuln_type=String(), state=String(),
                           approval_status=String())

    def __str__(self):
        return self.id + '_finding'

    def resolve_id(self, info):
        """Resolve id attribute."""
        del info
        return self.id

    def resolve_project_name(self, info):
        """Resolve project_name attribute."""
        del info
        return self.project_name

    @get_entity_cache
    def resolve_vulnerabilities(self, info,
                                vuln_type='', state='', approval_status=''):
        """Resolve vulnerabilities attribute."""
        vulns_loader = info.context.loaders['vulnerability']
        vuln_filtered = vulns_loader.load(self.id)

        if vuln_type:
            vuln_filtered = vuln_filtered.then(lambda vulns: [
                vuln for vuln in vulns if vuln.vuln_type == vuln_type and
                (vuln.current_approval_status != 'PENDING' or
                 vuln.last_approved_status)])
        if state:
            vuln_filtered = vuln_filtered.then(lambda vulns: [
                vuln for vuln in vulns
                if vuln_domain.get_current_state(vuln) == state and
                (vuln.current_approval_status != 'PENDING' or
                 vuln.last_approved_status)])
        if approval_status:
            vuln_filtered = vuln_filtered.then(lambda vulns: [
                vuln for vuln in vulns
                if vuln.current_approval_status == approval_status])

        return vuln_filtered

    @get_entity_cache
    def resolve_open_vulnerabilities(self, info):
        """Resolve open vulnerabilities attribute."""
        vulns_loader = info.context.loaders['vulnerability']
        vulns = vulns_loader.load(self.id)

        self.open_vulnerabilities = vulns.then(lambda vulns: len([
            vuln for vuln in vulns
            if vuln_domain.get_current_state(vuln) == 'open' and
            (vuln.current_approval_status != 'PENDING' or
             vuln.last_approved_status)]))

        return self.open_vulnerabilities

    def resolve_release_date(self, info):
        """Resolve release date attribute."""
        del info
        return self.release_date

    @get_entity_cache
    def resolve_closed_vulnerabilities(self, info):
        """Resolve closed vulnerabilities attribute."""
        vulns_loader = info.context.loaders['vulnerability']
        vulns = vulns_loader.load(self.id)

        self.closed_vulnerabilities = vulns.then(lambda vulns: len([
            vuln for vuln in vulns
            if vuln_domain.get_current_state(vuln) == 'closed' and
            (vuln.current_approval_status != 'PENDING' or
             vuln.last_approved_status)]))

        return self.closed_vulnerabilities

    @get_entity_cache
    def resolve_tracking(self, info):
        """Resolve tracking attribute."""
        if self.release_date:
            vulns_loader = info.context.loaders['vulnerability']
            vulns = vulns_loader.load(self.id).then(lambda vulns: vulns).get()
            self.tracking = finding_domain.get_tracking_vulnerabilities(vulns)
        else:
            self.tracking = []
        return self.tracking

    @get_entity_cache
    def resolve_records(self, info):
        """ Resolve compromised records attribute """
        del info
        if self.records['url']:
            self.records = finding_utils.get_records_from_file(
                self.project_name, self.id, self.records['url'])
        else:
            self.records = []
        return self.records

    def resolve_severity(self, info):
        """ Resolve severity values from Formstack """
        del info

        return self.severity

    def resolve_cvss_version(self, info):
        """ Resolve cvss version value from Formstack """
        del info

        return self.cvss_version

    @get_entity_cache
    def resolve_exploit(self, info):
        """ Resolve exploit attribute """
        del info
        if self.exploit['url']:
            self.exploit = finding_utils.get_exploit_from_file(
                self.project_name, self.id, self.exploit['url'])
        else:
            self.exploit = ''
        return self.exploit

    def resolve_evidence(self, info):
        """ Resolve evidence attribute """
        del info
        return self.evidence

    @get_entity_cache
    def resolve_comments(self, info):
        """ Resolve comments attribute """
        del info

        self.comments = comment_domain.get_comments(self.id)
        return self.comments

    @require_role(['analyst', 'admin'])
    @get_entity_cache
    def resolve_observations(self, info):
        """ Resolve observations attribute """
        del info

        self.observations = comment_domain.get_observations(self.id)
        return self.observations

    def resolve_report_level(self, info):
        """ Resolve report_level attribute """
        del info
        return self.report_level

    def resolve_title(self, info):
        """ Resolve title attribute """
        del info
        return self.title

    def resolve_scenario(self, info):
        """ Resolve scenario attribute """
        del info
        return self.scenario

    def resolve_actor(self, info):
        """ Resolve actor attribute """
        del info
        return self.actor

    def resolve_description(self, info):
        """ Resolve description attribute """
        del info
        return self.description

    def resolve_requirements(self, info):
        """ Resolve requirements attribute """
        del info
        return self.requirements

    def resolve_attack_vector_desc(self, info):
        """ Resolve attack vector description attribute """
        del info
        return self.attack_vector_desc

    def resolve_threat(self, info):
        """ Resolve threat attribute """
        del info
        return self.threat

    def resolve_recommendation(self, info):
        """ Resolve recommendation attribute """
        del info
        return self.recommendation

    def resolve_affected_systems(self, info):
        """ Resolve affected_systems attribute """
        del info
        return self.affected_systems

    def resolve_compromised_attributes(self, info):
        """ Resolve compromised_attributes attribute """
        del info
        return self.compromised_attributes

    def resolve_compromised_records(self, info):
        """ Resolve compromised_records attribute """
        del info
        return self.compromised_records

    def resolve_cwe_url(self, info):
        """ Resolve cwe_url attribute """
        del info

        return self.cwe_url

    def resolve_bts_url(self, info):
        """ Resolve bts_url attribute """
        del info
        return self.bts_url

    @get_entity_cache
    def resolve_treatment(self, info):
        """ Resolve treatment attribute """
        vulns_loader = info.context.loaders['vulnerability']
        vulns = vulns_loader.load(self.id)

        treatment = self.treatment
        self.treatment = vulns.then(lambda vulns: (
            treatment
            if [vuln for vuln in vulns
                if vuln_domain.get_last_approved_status(vuln) == 'open']
            else '-'))
        return self.treatment

    def resolve_treatment_manager(self, info):
        """ Resolve treatment_manager attribute """
        del info
        return self.treatment_manager

    def resolve_treatment_justification(self, info):
        """ Resolve treatment_justification attribute """
        del info
        return self.treatment_justification

    def resolve_client_code(self, info):
        """ Resolve client_code attribute """
        del info
        return self.client_code

    def resolve_client_project(self, info):
        """ Resolve client_project attribute """
        del info
        return self.client_project

    def resolve_probability(self, info):
        """ Resolve probability attribute """
        del info
        return self.probability

    def resolve_detailed_severity(self, info):
        """ Resolve detailed_severity attribute """
        del info
        return self.detailed_severity

    def resolve_risk(self, info):
        """ Resolve risk attribute """
        del info
        return self.risk

    def resolve_risk_level(self, info):
        """ Resolve risk_level attribute """
        del info
        return self.risk_level

    def resolve_ambit(self, info):
        """ Resolve ambit attribute """
        del info
        return self.ambit

    def resolve_category(self, info):
        """ Resolve category attribute """
        del info
        return self.category

    @get_entity_cache
    def resolve_state(self, info):
        """ Resolve state attribute """
        vulns_loader = info.context.loaders['vulnerability']
        vulns = vulns_loader.load(self.id)

        self.state = vulns.then(lambda vulns: 'open' if [
            vuln for vuln in vulns
            if vuln_domain.get_last_approved_status(vuln) == 'open']
            else 'closed')

        return self.state

    def resolve_remediated(self, info):
        """ Resolve remediated attribute """
        del info
        return self.remediated

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
        return self.severity_score

    def resolve_report_date(self, info):
        """ Resolve report date """
        del info
        return self.report_date

    @require_role(['analyst', 'admin'])
    def resolve_analyst(self, info):
        """ Resolve analyst attribute """
        del info
        return self.analyst

    def resolve_acceptance_date(self, info):
        """ Resolve acceptance_date attribute """
        del info
        return self.acceptance_date


class UpdateEvidence(Mutation):
    """ Update evidence files """

    class Arguments(object):
        finding_id = String(required=True)
        evidence_id = String(required=True)
    success = Boolean()
    finding = Field(Finding)

    @require_login
    @require_role(['analyst', 'admin'])
    @require_finding_access
    def mutate(self, info, evidence_id, finding_id):
        success = False
        uploaded_file = info.context.FILES.get('document', '')
        project_name = get_project_name(finding_id).lower()
        if util.assert_uploaded_file_mime(uploaded_file,
                                          ['image/gif',
                                           'image/png',
                                           'text/x-python',
                                           'text/x-objective-c',
                                           'text/x-c',
                                           'text/plain',
                                           'text/html']):
            if evidence_exceeds_size(uploaded_file,
                                     int(evidence_id), info.context):
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
                success = finding_domain.save_evidence(fieldname[int(evidence_id)],
                                                       finding_id,
                                                       project_name,
                                                       uploaded_file)
        else:
            util.cloudwatch_log(info.context,
                                'Security: Attempted to upload evidence file with a \
                                    non-allowed format in {project} project'
                                    .format(project=project_name))
            raise GraphQLError('Extension not allowed')
        findings_loader = info.context.loaders['finding']
        ret = UpdateEvidence(
            finding=findings_loader.load(finding_id), success=success)
        util.invalidate_cache(finding_id)
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
            success = finding_domain.add_file_attribute(
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

        findings_loader = info.context.loaders['finding']
        ret = UpdateEvidenceDescription(
            finding=findings_loader.load(finding_id), success=success)
        util.invalidate_cache(finding_id)
        return ret


def evidence_exceeds_size(uploaded_file, evidence_type, context):
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
        util.cloudwatch_log(context, 'Security: \
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
        project = integrates_dal.get_finding_project(finding_id)
        success = False
        success = finding_domain.save_severity(parameters.get('data'))
        findings_loader = info.context.loaders['finding']
        ret = UpdateSeverity(
            finding=findings_loader.load(finding_id), success=success)
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
            role = get_user_role(user_data)
            if parameters.get('type') == 'observation' and \
               role not in ['analyst', 'admin']:
                util.cloudwatch_log(info.context, 'Security: \
                    Unauthorized role attempted to add observation')
                raise GraphQLError('Access denied')

            user_email = user_data['user_email']
            comment_id = int(round(time() * 1000))
            comment_data = {
                'user_id': comment_id,
                'comment_type': parameters.get('type'),
                'content': parameters.get('content'),
                'fullname': str.join(' ', [user_data['first_name'],
                                     user_data['last_name']]),
                'parent': int(parameters.get('parent')),
            }
            success = finding_domain.add_comment(
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
        success = finding_domain.verify_finding(
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
        user_info = util.get_jwt_content(info.context)
        success = finding_domain.request_verification(
            finding_id=finding_id,
            user_email=user_info['user_email'],
            user_fullname=str.join(' ',
                                   [user_info['first_name'],
                                    user_info['last_name']]),
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
        success = finding_domain.update_description(finding_id, parameters)
        if success:
            util.cloudwatch_log(info.context, 'Security: Updated description in\
                finding {id} succesfully'.format(id=finding_id))
        else:
            util.cloudwatch_log(info.context, 'Security: Attempted to update \
                description in finding {id}'.format(id=finding_id))
        findings_loader = info.context.loaders['finding']
        ret = UpdateDescription(
            finding=findings_loader.load(finding_id), success=success)
        project_name = get_project_name(finding_id)
        util.invalidate_cache(finding_id)
        util.invalidate_cache(project_name)
        return ret


class UpdateTreatment(Mutation):
    """ Update treatment of a finding """
    class Arguments(object):
        acceptance_date = String()
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
        user_data = util.get_jwt_content(info.context)
        project_name = get_project_name(finding_id)

        if parameters['treatment'] == 'IN PROGRESS':
            if not is_customeradmin(project_name, user_data['user_email']):
                parameters['treatment_manager'] = user_data['user_email']
            if parameters.get('treatment_manager'):
                project_users = [user[0]
                                 for user in integrates_dal.get_project_users(project_name)
                                 if user[1] == 1]
                customer_roles = ['customer', 'customeradmin']
                customer_users = [user
                                  for user in project_users
                                  if get_role(user) in customer_roles]
                if parameters.get('treatment_manager') not in customer_users:
                    raise GraphQLError('Invalid treatment manager')
            else:
                raise GraphQLError('Invalid treatment manager')
        elif parameters['treatment'] == 'ACCEPTED':
            parameters['treatment_manager'] = user_data['user_email']
        success = finding_domain.update_treatment(finding_id,
                                                  parameters)
        if success:
            util.cloudwatch_log(info.context, 'Security: Updated treatment in\
                finding {id} succesfully'.format(id=finding_id))
        else:
            util.cloudwatch_log(info.context, 'Security: Attempted to update \
                treatment in finding {id}'.format(id=finding_id))
        findings_loader = info.context.loaders['finding']
        ret = UpdateTreatment(
            finding=findings_loader.load(finding_id), success=success)
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
            success = finding_domain.reject_draft(finding_id,
                                                  reviewer_email,
                                                  project_name,
                                                  info.context)
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
            success = finding_domain.delete_finding(finding_id,
                                                    project_name,
                                                    justification,
                                                    info.context)
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
            success, release_date = \
                finding_domain.approve_draft(draft_id, project_name, info.context)
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


class CreateDraft(Mutation):
    """ Creates a new draft """
    class Arguments(object):
        cwe = String(required=False)
        description = String(required=False)
        project_name = String(required=True)
        recommendation = String(required=False)
        requirements = String(required=False)
        risk = String(required=False)
        threat = String(required=False)
        title = String(required=True)
        type = Argument(Enum('FindingType', [
            ('SECURITY', 'SECURITY'), ('HYGIENE', 'HYGIENE')]), required=False)
    success = Boolean()

    @require_login
    @require_role(['admin', 'analyst'])
    @require_project_access
    def mutate(self, info, project_name, title, **kwargs):
        analyst_email = util.get_jwt_content(info.context)['user_email']
        success = finding_domain.create_draft(
            analyst_email, project_name, title, **kwargs)

        if success:
            util.cloudwatch_log(info.context, 'Security: Created draft in '
                                '{} project succesfully'.format(project_name))
        return CreateDraft(success=success)


class SubmitDraft(Mutation):
    """ Submits a draft for review """
    class Arguments(object):
        finding_id = String(required=True)
    success = Boolean()

    @require_login
    @require_role(['admin', 'analyst'])
    @require_finding_access
    def mutate(self, info, finding_id):
        analyst_email = util.get_jwt_content(info.context)['user_email']
        success = finding_domain.submit_draft(finding_id, analyst_email)

        if success:
            util.invalidate_cache(finding_id)
            util.cloudwatch_log(info.context, 'Security: Submitted draft '
                                '{} succesfully'.format(finding_id))
        return SubmitDraft(success=success)
