#!/usr/bin/env bash

deps_production() {

  # Builds container if any of the specified files
  # was modified

  set -e

  # import functions
  . <(curl -s https://gitlab.com/fluidattacks/public/raw/master/shared-scripts/build-container.sh)
  . ci-scripts/helpers/check-changed.sh

  local NAME

  NAME='deps-production'
  FILES=(
    'front/package.json'
    'deploy/containers/deps-production/Dockerfile'
    'deploy/containers/deps-production/requirements.txt'
    'deploy/containers/deps-production/requirements_local.txt'
    'ci-scripts/jobs/deps-production.sh'
  )
  FOLDERS=(
      'ci-scripts/helpers/'
  )
  if [ x"$CI_COMMIT_REF_NAME" = x"master" ] \
     || check_folder_changed "${FOLDERS[@]}" \
     || check_file_changed "${FILES[@]}" \
     || docker_tag_not_exists deps-production $CI_COMMIT_REF_NAME \
     || container_image_differs deps-production $CI_COMMIT_REF_NAME \
     || [ $SCHEDULE ]; then
    cp -r \
      front/ \
      deploy/containers/deps-production/
    build_container \
      "registry.gitlab.com/fluidattacks/integrates/$NAME:$CI_COMMIT_REF_NAME" \
      "deploy/containers/$NAME" \
    	--build-arg CI_COMMIT_REF_NAME="$CI_COMMIT_REF_NAME"
  else
      echo "No relevant files for $NAME were modified. Skipping build."
  fi

}

deps_production
