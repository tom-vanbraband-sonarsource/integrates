#!/usr/bin/env bash

# shellcheck disable=SC2086

commitlint() {

  # Run commitlints in every commit from a MR

  set -e

  git fetch --prune &> /dev/null

  local N_COMMITS
  N_COMMITS=$(
    git log --oneline origin/master..origin/$CI_COMMIT_REF_NAME | wc -l
  )

  for ((i = 0 ; i < N_COMMITS ; i++)); do
    if ! git rev-parse HEAD~$i | xargs git log -1 --pretty=%B | npx commitlint
    then
      exit 1
    fi
  done
}

commitlint
