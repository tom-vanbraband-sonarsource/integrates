#!/usr/bin/env bash

get_changed(){

  # Get changed files in a commit

  # Get modified files based on whether branch is master or dev
  local CHANGED
  if [[ "$CI_COMMIT_REF_NAME" == 'master' ]]; then
    CHANGED=$(git diff --name-only "$CI_COMMIT_BEFORE_SHA" "$CI_COMMIT_SHA")
  else
    CHANGED=$(git diff --name-only origin/master HEAD)
  fi

  # Keep only existing files in changed
  local NEW_CHANGED
  for FILE in $CHANGED; do
    if [ -f "$FILE" ]; then
      NEW_CHANGED+="$FILE "
    fi
  done
  CHANGED=$NEW_CHANGED

  echo "$CHANGED"
}

check_file_changed(){

  # Checks if one or more files were modified.

  local FILES
  FILES=("$@")

  local CHANGED
  CHANGED=$(get_changed)

  echo 'Files to check are:'
  echo "${FILES[@]}"

  echo 'Modified files are:'
  echo "$CHANGED"

  for CHANGED_FILE in $CHANGED; do
    for FILE in "${FILES[@]}"; do
      if [[ "$CHANGED_FILE" == "$FILE" ]]; then
        echo "$FILE was modified."
        return 0
      fi
    done
  done

  echo "None of the entered files was modified."
  return 1
}

check_folder_changed() {

  # Checks if one or more folders were modified.
  # Given folders MUST come with a / at the end

  local FOLDERS
  FOLDERS=("$@")

  local CHANGED
  CHANGED=$(get_changed)

  echo 'Files to check are:'
  echo "${FOLDERS[@]}"

  echo 'Modified files are:'
  echo "$CHANGED"

  for CHANGED_FILE in $CHANGED; do
    for FOLDER in "${FOLDERS[@]}"; do
      if [[ "$CHANGED_FILE" =~ $FOLDER ]]; then
        echo "$FOLDER was modified."
        return 0
      fi
    done
  done

  echo "None of the entered files was modified."
  return 1
}
