#!/bin/bash

# Enable debugging.
if [ -n "$VERBOSE" ]; then
  set -x
fi

# Exit immediately if any command returns different from zero.
set -e

SERVER="integrates"
CI_COMMIT_REF_NAME=$1
TORUS_TOKEN_ID=$2
TORUS_TOKEN_SECRET=$3
TORUS_ORG=$4
TORUS_PROJECT=$5

if [ "$CI_COMMIT_REF_NAME" = "master" ]; then
	export TORUS_ENVIRONMENT=production
else
	export TORUS_ENVIRONMENT=development
fi

# Start message.
echo "---### [${SERVER}] Compilando contenedor."

# Build the image.
cp -a deploy/containers/common deploy/containers/integrates
docker build --no-cache --build-arg ci_commit_ref_name="$CI_COMMIT_REF_NAME" \
    --build-arg torus_token_id="$TORUS_TOKEN_ID" \
    --build-arg torus_token_secret="$TORUS_TOKEN_SECRET" \
    --build-arg torus_org="$TORUS_ORG" \
    --build-arg torus_project="$TORUS_PROJECT" \
    --build-arg torus_environment="$TORUS_ENVIRONMENT" \
	-t "registry.gitlab.com/fluidsignal/integrates:$CI_COMMIT_REF_NAME" deploy/containers/integrates/
rm -rf common
