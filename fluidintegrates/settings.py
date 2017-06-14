"""
Django settings for fluidintegrates project.

Generated by 'django-admin startproject' using Django 1.10.1.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.10/ref/settings/
"""

import os
import sys
sys.path.append('/usr/src/app')

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'oxz^4@97nkz*#490#(-5wtt8go=$pfaybg@is8se+et!$6r%x7' # noqa

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["192.168.0.12", "localhost", "127.0.0.1", "fluid.la"]


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
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'social_django.middleware.SocialAuthExceptionMiddleware',
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
        'USER': 'root',
        'PASSWORD': '9O32032;E5q]VIj',
        'HOST': 'fluidservesexams.cgsvzmr33idc.us-east-1.rds.amazonaws.com',
        'PORT': '3306',
        'OPTIONS': {
            'sql_mode': 'STRICT_TRANS_TABLES',
        }
    },
    'integrates': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'fluidintegrates',
        'USER': 'root',
        'PASSWORD': '9O32032;E5q]VIj',
        'HOST': 'fluidservesexams.cgsvzmr33idc.us-east-1.rds.amazonaws.com',
        'PORT': '3306',
        'OPTIONS': {
            'sql_mode': 'STRICT_TRANS_TABLES',
        }
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.\
            UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.\
            MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.\
            CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.\
            NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


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
TEMPLATE_CONTEXT_PROCESSORS = (
    "django.core.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    'django.core.context_processors.static',
)

STATICFILES_DIRS = (
    os.path.join(PROJECT_ROOT, '../app/assets'),
)

AUTHENTICATION_BACKENDS = (
    'social_core.backends.github.GithubOAuth2',
    'social_core.backends.twitter.TwitterOAuth',
    'social_core.backends.facebook.FacebookOAuth2',
    'social_core.backends.google.GoogleOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

#Session
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_NAME = "Integratesv3"
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_AGE = 40*60

# Social
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.social_auth.associate_by_email',
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


SOCIAL_AUTH_SANITIZE_REDIRECTS = False
SOCIAL_AUTH_REDIRECT_IS_HTTPS = True
SOCIAL_AUTH_USERNAME_IS_FULL_EMAIL = True
USE_X_FORWARDED_HOST = True

#SOCIAL_AUTH_LOGIN_REDIRECT_URL = 'https://fluid.la/integrates/registration'
#SOCIAL_AUTH_NEW_USER_REDIRECT_URL = 'https://fluid.la/integrates/registration'
SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/registration'
SOCIAL_AUTH_NEW_USER_REDIRECT_URL = '/registration'
SOCIAL_AUTH_DISCONNECT_REDIRECT_URL = '/index'
SOCIAL_AUTH_INACTIVE_USER_URL = '/index'
SOCIAL_AUTH_LOGIN_URL = '/index'
SOCIAL_AUTH_LOGIN_ERROR_URL = '/index'

#FIELDS_STORED_IN_SESSION = ['username', 'registered', 'role']

SOCIAL_AUTH_TWITTER_KEY = 'qhAxMXTOjEnTCSGCHn8Rz9TIg'
SOCIAL_AUTH_TWITTER_SECRET = \
    'f4mWMboCK86MR06XcA6z1a5bLFpZCIAzxLdQuM4yod08B57oLp' # noqa
SOCIAL_AUTH_TWITTER_SCOPE = ['email']
SOCIAL_AUTH_TWITTER_PROFILE_EXTRA_PARAMS = {
    'fields': 'email'
}

# Google OAuth2 (google-oauth2)
SOCIAL_AUTH_GOOGLE_OAUTH2_IGNORE_DEFAULT_SCOPE = True
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = \
    '65328559770-aatq8b00rvk05qn2h523hn328drt9ehc.apps.googleusercontent.com'
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = 'gvd_U6HtBlyKsSynPpz6LRd-' # noqa
