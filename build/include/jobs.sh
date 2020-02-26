# shellcheck shell=bash

source "${srcIncludeHelpers}"
source "${srcExternalGitlabVariables}"
source "${srcExternalSops}"
source "${srcExternalSops}"
source "${srcCiScriptsHelpersSops}"

function job_deploy_container_nix_cache {
  local context='.'
  local dockerfile='build/Dockerfile'
  local tag="${CI_REGISTRY_IMAGE}:nix"

  helper_docker_build_and_push \
    "${tag}" \
    "${context}" \
    "${dockerfile}"
}

function job_deploy_container_deps_base {
  local context='.'
  local dockerfile='deploy/containers/deps-base/Dockerfile'
  local tag="${CI_REGISTRY_IMAGE}/deps-base:${CI_COMMIT_REF_NAME}"

  helper_docker_build_and_push \
    "${tag}" \
    "${context}" \
    "${dockerfile}"
}

function job_deploy_container_deps_mobile {
  local context='.'
  local dockerfile='deploy/containers/deps-mobile/Dockerfile'
  local tag="${CI_REGISTRY_IMAGE}/deps-mobile:${CI_COMMIT_REF_NAME}"

  helper_docker_build_and_push \
    "${tag}" \
    "${context}" \
    "${dockerfile}"
}

function job_deploy_container_deps_development {
  local context='.'
  local dockerfile='deploy/containers/deps-development/Dockerfile'
  local tag="${CI_REGISTRY_IMAGE}/deps-development:${CI_COMMIT_REF_NAME}"
  local build_arg_1='CI_COMMIT_REF_NAME'

  helper_docker_build_and_push \
    "${tag}" \
    "${context}" \
    "${dockerfile}" \
    "${build_arg_1}" "${!build_arg_1}"
}

function job_deploy_container_deps_production {
  local context='.'
  local dockerfile='deploy/containers/deps-production/Dockerfile'
  local tag="${CI_REGISTRY_IMAGE}/deps-production:${CI_COMMIT_REF_NAME}"
  local build_arg_1='CI_COMMIT_REF_NAME'

  helper_docker_build_and_push \
    "${tag}" \
    "${context}" \
    "${dockerfile}" \
    "${build_arg_1}" "${!build_arg_1}"
}

function job_serve_dynamodb_local {
  local port=8022

      echo '[INFO] Launching DynamoDB local' \
  &&  {
        java \
          -Djava.library.path=./.DynamoDB/DynamoDBLocal_lib \
          -jar ./.DynamoDB/DynamoDBLocal.jar \
          -inMemory \
          -port "${port}" \
          -sharedDb \
        &
      } \
  &&  echo '[INFO] Waiting 5 seconds to leave DynamoDB start' \
  &&  sleep 5 \
  &&  echo '[INFO] Populating DynamoDB local' \
  &&  bash ./deploy/containers/common/vars/provision_local_db.sh \
  &&  echo "[INFO] DynamoDB is ready and listening on port ${port}!" \
  &&  echo "[INFO] Hit Ctrl+C to exit" \
  &&  fg %1
}

function job_serve_front {
      pushd front \
    &&  npm install \
    &&  npm start \
  &&  popd \
  ||  return 1
}

function job_serve_redis {
  local port=6379

      echo "[INFO] Serving redis on port ${port}" \
  &&  redis-server --port "${port}"
}

function job_serve_back_dev {
  local app='fluidintegrates.asgi:application'
  local host='0.0.0.0'
  local port='8080'
  local root_path='/integrates'
  local workers='4'

      helper_set_dev_secrets \
  &&  echo "[INFO] Serving back on port ${port}" \
  &&  uvicorn \
        --host="${host}" \
        --port="${port}" \
        --root-path="${root_path}" \
        --ssl-certfile="${srcDerivationsCerts}/fluidla.crt" \
        --ssl-keyfile="${srcDerivationsCerts}/fluidla.key" \
        --workers="${workers}" \
        "${app}"
}

function job_lint_back {
      prospector -F -s high -u django -i node_modules app \
  &&  prospector -F -s high -u django -i node_modules django-apps \
  &&  prospector -F -s veryhigh -u django -i node_modules fluidintegrates \
  &&  prospector -F -s veryhigh lambda
}

function job_lint_build_system {
  # SC1090: Can't follow non-constant source. Use a directive to specify location.
  # SC2016: Expressions don't expand in single quotes, use double quotes for that.
  # SC2153: Possible misspelling: TEMP_FILE2 may not be assigned, but TEMP_FILE1 is.
  # SC2154: var is referenced but not assigned.

      nix-linter --recursive . \
  && echo '[OK] Nix code is compliant'
      shellcheck --external-sources build.sh \
  && find 'build' -name '*.sh' -exec \
      shellcheck --external-sources --exclude=SC1090,SC2016,SC2153,SC2154 {} +
}

function job_lint_front {
      pushd front \
    &&  npm install \
    &&  npm run audit \
    &&  npm run lint \
  &&  popd \
  ||  return 1
}

function job_test_back {
      echo '[INFO] Remember to restart the DynamoDB database on each execution' \
  &&  helper_set_dev_secrets \
  &&  pytest \
        -n auto \
        --ds=fluidintegrates.settings \
        --dist=loadscope \
        --verbose \
        --maxfail=20 \
        --cov=fluidintegrates \
        --cov=app \
        --cov="${pyPkgIntegratesBack}/site-packages/back-end" \
        --cov-report term \
        --cov-report html:build/coverage/html \
        --cov-report xml:build/coverage/results.xml \
        --cov-report annotate:build/coverage/annotate \
        --disable-warnings \
        test/
}

function job_test_front {
      pushd front \
    &&  npm install \
    &&  npm test \
  &&  popd \
  ||  return 1
}
