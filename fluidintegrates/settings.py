"""
Django settings for fluidintegrates project.

Generated by 'django-admin startproject' using Django 1.10.1.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.10/ref/settings/
"""
# pylint: disable=E0402
from __future__ import absolute_import
import newrelic.agent
import sys
import os
from __init__ import FI_DJANGO_SECRET_KEY, FI_DB_USER, FI_DB_PASSWD, FI_DB_HOST, \
    FI_AWS_CLOUDWATCH_ACCESS_KEY, FI_AWS_CLOUDWATCH_SECRET_KEY, FI_MIXPANEL_API_TOKEN, \
    FI_INTERCOM_APPID, FI_INTERCOM_SECURE_KEY, FI_SLACK_BOT_TOKEN, FI_GOOGLE_OAUTH2_KEY, \
    FI_DEBUG, FI_GOOGLE_OAUTH2_SECRET, FI_AZUREAD_OAUTH2_KEY, FI_AZUREAD_OAUTH2_SECRET, \
    FI_ROLLBAR_ACCESS_TOKEN, FI_ENVIRONMENT, FI_JWT_SECRET, FI_REDIS_SERVER
from boto3.session import Session
import rollbar
from .production import FIELDS_FINDING, FN_URL, FIELDS_EVENT, EV_URL

FIELDS_FINDING = FIELDS_FINDING
FIELDS_EVENT = FIELDS_EVENT
FN_URL = FN_URL
EV_URL = EV_URL

sys.path.append('/usr/src/app')
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Init New Relic agent
new_relic_conf_file = os.path.join(BASE_DIR, 'newrelic.ini')
newrelic.agent.initialize(new_relic_conf_file)


SECRET_KEY = FI_DJANGO_SECRET_KEY

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = FI_DEBUG == 'True'

ALLOWED_HOSTS = ["192.168.0.26", "localhost", "127.0.0.1", "fluid.la",
                 "fluidattacks.com", "192.168.200.100.xip.io", "192.168.200.100",
                 ".integrates.env.fluidattacks.com"]

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'social_django',
    'sslserver',
    'django_crontab',
    'analytical',
    'django_intercom',
    'app.slackbot',
    'graphene_django',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'rollbar.contrib.django.middleware.RollbarNotifierMiddleware',
    'app.middleware.SocialAuthException'
]

ROOT_URLCONF = 'fluidintegrates.urls'
SETTINGS_PATH = os.path.normpath(os.path.dirname(__file__))

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(SETTINGS_PATH, '../app/templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]

WSGI_APPLICATION = 'fluidintegrates.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'django',
        'USER': FI_DB_USER,
        'PASSWORD': FI_DB_PASSWD,
        'HOST': FI_DB_HOST,
        'PORT': '3306',
        'OPTIONS': {
            'sql_mode': 'STRICT_TRANS_TABLES',
        }
    },
    'integrates': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'fluidintegrates',
        'USER': FI_DB_USER,
        'PASSWORD': FI_DB_PASSWD,
        'HOST': FI_DB_HOST,
        'PORT': '3306',
        'OPTIONS': {
            'sql_mode': 'STRICT_TRANS_TABLES',
        }
    },
}

# Rollbar configuration
ROLLBAR = {
    'access_token': FI_ROLLBAR_ACCESS_TOKEN,
    'environment': FI_ENVIRONMENT,
    'enabled': False if DEBUG else True,
    'root': BASE_DIR,
}
rollbar.init(**ROLLBAR)

# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'America/Bogota'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Logging
AWS_ACCESS_KEY_ID = FI_AWS_CLOUDWATCH_ACCESS_KEY
AWS_SECRET_ACCESS_KEY = FI_AWS_CLOUDWATCH_SECRET_KEY # noqa
AWS_REGION_NAME = 'us-east-1'

boto3_session = Session(aws_access_key_id=AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                        region_name=AWS_REGION_NAME)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'console': {
            'level': 'ERROR',
            'class': 'logging.StreamHandler'
        },
        'watchtower': {
            'level': 'INFO',
            'class': 'watchtower.CloudWatchLogHandler',
                     'boto3_session': boto3_session,
                     'log_group': 'FLUID',
                     'stream_name': 'FLUIDIntegrates',
            'formatter': 'aws',
        },
    },
    'formatters': {
        'simple': {
            'format': u"%(asctime)s [%(levelname)-8s] %(message)s",
            'datefmt': "%Y-%m-%d %H:%M:%S"
        },
        'aws': {
            'format': u"%(asctime)s [%(levelname)-8s] %(message)s",
            'datefmt': "%Y-%m-%d %H:%M:%S"
        },
    },
    'loggers': {
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': True,
        },
        'django_crontab.crontab': {
            'handlers': ['console'],
            'level': 'INFO'
        },
        'app': {
            'handlers': ['console', 'watchtower'],
            'level': 'INFO'
        },
    }
}

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
MEDIA_ROOT = ''
MEDIA_URL = ''
STATIC_ROOT = ''
STATIC_URL = '/assets/'
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

STATICFILES_DIRS = (
    os.path.join(PROJECT_ROOT, '../app/assets'),
)

CRONJOBS = [
    ('0 5 * * 1', 'app.scheduler.get_new_vulnerabilities'),
    ('0 4 * * 1', 'app.scheduler.update_new_vulnerabilities'),
    ('0 7,16 * * 1-5', 'app.scheduler.get_remediated_findings'),
    ('0 7,15 * * 1-5', 'app.scheduler.get_new_releases'),
    ('0 5 * * 1', 'app.scheduler.weekly_report'),
    ('0 4 * * *', 'app.scheduler.inactive_users'),
    ('0 18 * * 1-5', 'app.scheduler.continuous_report'),
    ('0 9 * * 1-5', 'app.scheduler.send_unsolved_events_email_to_all_projects'),
    ('0 8 * * 1-6', 'app.scheduler.deletion_of_finished_project'),
]

AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.azuread.AzureADOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://" + FI_REDIS_SERVER + ":6379",
        "OPTIONS": {
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
            'REDIS_CLIENT_CLASS': 'rediscluster.RedisCluster',
            'CONNECTION_POOL_CLASS': 'rediscluster.connection.ClusterConnectionPool',
            'CONNECTION_POOL_KWARGS': {
                'skip_full_coverage_check': True
            }
        },
        "KEY_PREFIX": "fi"
    }
}

CACHE_TTL = 60 * 60 * 8

# Session
SESSION_ENGINE = 'redis_sessions.session'
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_NAME = "Integratesv3"
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_AGE = 40*60

SESSION_REDIS = {
    'host': FI_REDIS_SERVER,
    'port': 6379,
    'db': 0,
    'prefix': 'fi_session',
    'socket_timeout': 1,
    'retry_on_timeout': False,
    'cluster': True
}

# JWT
JWT_COOKIE_NAME = "integrates_session"
JWT_SECRET = FI_JWT_SECRET

# Social
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'app.pipeline.user.create_user',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
    'app.pipeline.user.check_registered',
)

LOGIN_URL = 'login'
LOGOUT_URL = 'logout'
LOGIN_REDIRECT_URL = 'registration'
LOGIN_ERROR_URL = 'error401'


SOCIAL_AUTH_SANITIZE_REDIRECTS = False
SOCIAL_AUTH_REDIRECT_IS_HTTPS = True
SOCIAL_AUTH_USERNAME_IS_FULL_EMAIL = True
USE_X_FORWARDED_HOST = True

# django-analytical
MIXPANEL_API_TOKEN = FI_MIXPANEL_API_TOKEN
ANALYTICAL_AUTO_IDENTIFY = False

# Intercom
INTERCOM_APPID = FI_INTERCOM_APPID
INTERCOM_SECURE_KEY = FI_INTERCOM_SECURE_KEY
INTERCOM_USER_DATA_CLASS = 'app.pipeline.intercom_custom_data.IntercomUserData'
INTERCOM_INCLUDE_USERID = False
INTERCOM_CUSTOM_DATA_CLASSES = [
    'app.pipeline.intercom_custom_data.IntercomCustomData',
]


# Slack
SLACK_BOT_TOKEN = FI_SLACK_BOT_TOKEN

if DEBUG:
    SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/registration'
    SOCIAL_AUTH_NEW_USER_REDIRECT_URL = '/registration'
else:
    SOCIAL_AUTH_LOGIN_REDIRECT_URL = 'https://fluidattacks.com/integrates/registration'
    SOCIAL_AUTH_NEW_USER_REDIRECT_URL = 'https://fluidattacks.com/integrates/registration'

SOCIAL_AUTH_DISCONNECT_REDIRECT_URL = '/index'
SOCIAL_AUTH_INACTIVE_USER_URL = '/index'
SOCIAL_AUTH_LOGIN_URL = '/index'
SOCIAL_AUTH_LOGIN_ERROR_URL = '/index'

# Google OAuth2
SOCIAL_AUTH_GOOGLE_OAUTH2_IGNORE_DEFAULT_SCOPE = True
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = FI_GOOGLE_OAUTH2_KEY
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = FI_GOOGLE_OAUTH2_SECRET # noqa

DRIVE_SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive'
]
DRIVE_SECRET_FILE = "/usr/src/app/config/drive_client_secret.json" # noqa
DRIVE_AUTHOR_FILE = "/usr/src/app/config/drive_authorization.json" # noqa
DRIVE_APP_NAME = 'FLUIDIntegrates_Drive'

# Azure OAuth2
SOCIAL_AUTH_AZUREAD_OAUTH2_KEY = FI_AZUREAD_OAUTH2_KEY
SOCIAL_AUTH_AZUREAD_OAUTH2_SECRET = FI_AZUREAD_OAUTH2_SECRET # noqa
