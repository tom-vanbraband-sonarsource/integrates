#!/usr/bin/env bash

deps_development() {

  # Builds container if any of the specified files
  # was modified

  set -e

  # import functions
  . ci-scripts/helpers/check-changed.sh
  . ci-scripts/helpers/others.sh

  local NAME

  NAME='deps-development'
  FILES=(
    'front/package.json'
    'deploy/containers/deps-development/Dockerfile'
    'deploy/containers/deps-development/requirements.txt'
    'deploy/containers/deps-production/requirements.txt'
    'deploy/containers/deps-production/requirements_local.txt'
    'ci-scripts/jobs/deps-development.sh'
  )
  FOLDERS=(
      'ci-scripts/helpers/'
      'django-apps/'
  )
  if check_folder_changed "${FOLDERS[@]}" \
     || check_file_changed "${FILES[@]}" \
     || docker_tag_not_exists deps-development $CI_COMMIT_REF_NAME \
     || container_image_differs deps-development $CI_COMMIT_REF_NAME \
     || [ $SCHEDULE ]; then
	  kaniko_build \
    		"$NAME" \
    		eph=true \
    		cache=true \
    		--build-arg CI_COMMIT_REF_NAME="$CI_COMMIT_REF_NAME"
  else
	echo "No relevant files for $NAME were modified. Skipping build."
  fi
}

deps_development
