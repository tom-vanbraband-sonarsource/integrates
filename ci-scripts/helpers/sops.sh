#!/usr/bin/env bash

aws_login() {

  # Log in to aws for resources

  set -Eeuo pipefail

  local USER

  USER="$1"

  export TF_VAR_aws_access_key
  export TF_VAR_aws_secret_key
  export AWS_ACCESS_KEY_ID
  export AWS_SECRET_ACCESS_KEY

  if [ "$USER"  == 'production' ]; then
    if [ "$CI_COMMIT_REF_NAME" == 'master' ]; then
      AWS_ACCESS_KEY_ID="$PROD_AWS_ACCESS_KEY_ID"
      AWS_SECRET_ACCESS_KEY="$PROD_AWS_SECRET_ACCESS_KEY"
    else
      echo 'Not enough permissions for logging in as production'
      return 1
    fi
  elif [ "$USER" == 'development' ]; then
    AWS_ACCESS_KEY_ID="$DEV_AWS_ACCESS_KEY_ID"
    AWS_SECRET_ACCESS_KEY="$DEV_AWS_SECRET_ACCESS_KEY"
  else
    echo 'No valid user was provided'
    return 1
  fi

  TF_VAR_aws_access_key="$AWS_ACCESS_KEY_ID"
  TF_VAR_aws_secret_key="$AWS_SECRET_ACCESS_KEY"

  aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
  aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
}

sops_vars() {
  local tmp_file
  # Set necessary vars for integrates

  set -Eeuo pipefail

  tmp_file=$(mktemp)

  # Import functions
  curl -sL 'https://static-objects.gitlab.net/fluidattacks/public/raw/master/shared-scripts/sops.sh' \
    > "${tmp_file}"
  source "${tmp_file}"

  local ENV_NAME

  ENV_NAME="$1"

  sops_env "secrets-$ENV_NAME.yaml" default \
    AWS_REDSHIFT_DBNAME \
    AWS_REDSHIFT_HOST \
    AWS_REDSHIFT_PASSWORD \
    AWS_REDSHIFT_USER \
    AZUREAD_OAUTH2_KEY \
    AZUREAD_OAUTH2_SECRET \
    CLOUDFRONT_ACCESS_KEY \
    CLOUDFRONT_PRIVATE_KEY \
    CLOUDFRONT_RESOURCES_DOMAIN \
    DB_HOST \
    DB_PASSWD \
    DB_USER \
    DEBUG \
    DJANGO_SECRET_KEY \
    DYNAMODB_HOST \
    DYNAMODB_PORT \
    ENVIRONMENT \
    FORCES_TRIGGER_REF \
    FORCES_TRIGGER_TOKEN \
    FORCES_TRIGGER_URL \
    GOOGLE_OAUTH2_KEY \
    GOOGLE_OAUTH2_KEY_ANDROID \
    GOOGLE_OAUTH2_KEY_IOS \
    GOOGLE_OAUTH2_SECRET \
    INTERCOM_API_ID \
    INTERCOM_SECURE_KEY \
    JWT_SECRET \
    JWT_SECRET_API \
    MAIL_CONTINUOUS \
    MAIL_PRODUCTION \
    MAIL_PROJECTS \
    MAIL_REVIEWERS \
    MAIL_RESOURCERS \
    MANDRILL_APIKEY \
    MIXPANEL_API_TOKEN \
    NEW_RELIC_API_KEY \
    NEW_RELIC_APP_ID \
    NEW_RELIC_LICENSE_KEY \
    NEW_RELIC_ENVIRONMENT \
    REDIS_SERVER \
    ROLLBAR_ACCESS_TOKEN \
    SLACK_BOT_ID \
    SLACK_BOT_TOKEN \
    SQS_QUEUE_URL \
    TEST_PROJECTS
}
