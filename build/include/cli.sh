# shellcheck shell=bash

source "${srcEnv}"
source "${srcIncludeHelpers}"
source "${srcIncludeJobs}"

function cli {
  local function_to_call

  function_to_call="${1:-}"

  if test -z "${function_to_call}" \
      || test "${function_to_call}" = '-h' \
      || test "${function_to_call}" = '--help'
  then
    echo
    echo "Use: ./build.sh [job-name]"
    echo
    echo 'List of jobs:'
    helper_list_declared_jobs | sed -e 's/^/  * /g'
    return 0
  fi

  echo '---'
  env_prepare_environment_variables
  env_prepare_ephemeral_vars
  env_prepare_dynamodb_local
  env_prepare_nodejs_modules
  env_prepare_python_packages
  if [ "${function_to_call}" == 'test_back_async' ]; then
    env_prepare_python_extra_packages
  fi

  echo "[INFO] Executing function: job_${function_to_call}"
  if "job_${function_to_call}"
  then
    echo
    echo "Successfully executed: ${function_to_call}"
    echo '  Congratulations!'
    return 0
  else
    echo
    echo 'We have found some problems :('
    echo '  You can replicate this by running:'
    echo "    integrates $ ./build.sh ${function_to_call}"
    return 1
  fi
}
