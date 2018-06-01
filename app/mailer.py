import mandrill

API_KEY = 'Cr-4ch24lDQrapMEy2F3VQ'


def __send_mail(template_name, email_to, context):
    mandrill_client = mandrill.Mandrill(API_KEY)
    message = {
        'to': [],
        'global_merge_vars': []
    }
    for em in email_to:
        message['to'].append({'email': em})

    for k, v in context.iteritems():
        message['global_merge_vars'].append(
            {'name': k, 'content': v}
        )
    mandrill_client.messages.send_template(template_name, [], message)

def send_mail_new_vulnerabilities(email_to, context):
    __send_mail('newvulnerabilitiesintegrates', email_to, context=context)


def send_mail_change_finding(email_to, context):
    __send_mail('changefindingintegrates', email_to, context=context)


def send_mail_new_user(email_to, context):
    __send_mail('userfindingintegrates', email_to, context=context)


def send_mail_delete_finding(email_to, context):
    __send_mail('deletefindingintegrates', email_to, context=context)


def send_mail_remediate_finding(email_to, context):
    __send_mail('remediatefindingintegrates', email_to, context=context)

def send_mail_new_comment(email_to, context):
    __send_mail('newcommentintegrates', email_to, context=context)

def send_mail_reply_comment(email_to, context):
    __send_mail('replycommentintegrates', email_to, context=context)

def send_mail_verified_finding(email_to, context):
    __send_mail('verifiedfindingintegrates', email_to, context=context)

def send_mail_new_remediated(email_to, context):
    __send_mail('newremediatefindingintegrates', email_to, context=context)

def send_mail_add_access(email_to, context):
    __send_mail('addaccessintegrates', email_to, context=context)

def send_mail_age_finding(email_to, context):
    __send_mail('agefindingintegrates', email_to, context=context)

def send_mail_age_kb_finding(email_to, context):
    __send_mail('agekbfindingintegrates', email_to, context=context)

def send_mail_reject_release(email_to, context):
    __send_mail('rejectreleaseintegrates', email_to, context=context)

def send_mail_new_releases(email_to, context):
    __send_mail('newreleasesintegrates', email_to, context=context)