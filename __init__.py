import os
import sys

try:
    FI_AWS_DYNAMODB_ACCESS_KEY = os.environ['FI_AWS_DYNAMODB_ACCESS_KEY']
    FI_AWS_DYNAMODB_SECRET_KEY = os.environ['FI_AWS_DYNAMODB_SECRET_KEY']
    FI_DJANGO_SECRET_KEY = os.environ['FI_DJANGO_SECRET_KEY']
    FI_DB_USER = os.environ['FI_DB_USER']
    FI_DB_PASSWD = os.environ['FI_DB_PASSWD']
    FI_DB_HOST = os.environ['FI_DB_HOST']
    FI_AWS_CLOUDWATCH_ACCESS_KEY = os.environ['FI_AWS_CLOUDWATCH_ACCESS_KEY']
    FI_AWS_CLOUDWATCH_SECRET_KEY = os.environ['FI_AWS_CLOUDWATCH_SECRET_KEY']
    FI_MIXPANEL_API_TOKEN = os.environ['FI_MIXPANEL_API_TOKEN']
    FI_INTERCOM_APPID = os.environ['FI_INTERCOM_APPID']
    FI_INTERCOM_SECURE_KEY = os.environ['FI_INTERCOM_SECURE_KEY']
    FI_SLACK_BOT_TOKEN = os.environ['FI_SLACK_BOT_TOKEN']
    FI_GOOGLE_OAUTH2_KEY = os.environ['FI_GOOGLE_OAUTH2_KEY']
    FI_GOOGLE_OAUTH2_SECRET = os.environ['FI_GOOGLE_OAUTH2_SECRET']
    FI_AZUREAD_OAUTH2_KEY = os.environ['FI_AZUREAD_OAUTH2_KEY']
    FI_AZUREAD_OAUTH2_SECRET = os.environ['FI_AZUREAD_OAUTH2_SECRET']
    FI_DRIVE_AUTHORIZATION = os.environ['FI_DRIVE_AUTHORIZATION']
    FI_FORMSTACK_TOKENS = os.environ['FI_FORMSTACK_TOKENS']
    FI_AWS_OUTPUT = os.environ['FI_AWS_OUTPUT']
    FI_DEBUG = os.environ['FI_DEBUG']
    FI_ROLLBAR_ACCESS_TOKEN = os.environ['FI_ROLLBAR_ACCESS_TOKEN']
except KeyError as e:
    print "Environment variable " + e.args[0] +  " doesn't exist"
    raise

var = [ 'FI_DJANGO_SECRET_KEY', 'FI_DB_USER', 'FI_DB_PASSWD', 'FI_DB_HOST', \
'FI_AWS_CLOUDWATCH_ACCESS_KEY', 'FI_AWS_CLOUDWATCH_SECRET_KEY', 'FI_MIXPANEL_API_TOKEN',\
'FI_INTERCOM_APPID','FI_INTERCOM_SECURE_KEY','FI_SLACK_BOT_TOKEN','FI_GOOGLE_OAUTH2_KEY', \
'FI_GOOGLE_OAUTH2_SECRET','FI_AZUREAD_OAUTH2_KEY','FI_AZUREAD_OAUTH2_SECRET', \
'FI_DRIVE_AUTHORIZATION','FI_FORMSTACK_TOKENS','FI_AWS_OUTPUT', \
'FI_AWS_DYNAMODB_ACCESS_KEY','FI_AWS_DYNAMODB_SECRET_KEY', 'FI_ROLLBAR_ACCESS_TOKEN', \
'FI_GITLAB_MACHINE', 'FI_GITLAB_LOGIN','FI_GITLAB_PASSWORD','FI_DOCUMENTROOT', \
'FI_SSL_KEY', 'FI_SSL_CERT', 'FI_DEBUG'  ]

n = [ 41, 10, 25, 54, 20, 40, 32, 8, 40, 42, 71, 24, 36, 44, 1019, 98, 4, 20, 40, 32, 10, 16, 20, 13, 2272, 1888, 5]

for x in range(0, len(var)-1):
    if os.environ[var[x]].count("")-1!= n[x]:
        print (' Environment variable "%s" invalid. Length must be %s' % (var[x], n[x]))
        sys.exit(-1)
