#!/usr/bin/env bash

publish_ota() {

  # Publishes an OTA update for mobile app

  # Import functions
  . ci-scripts/helpers/others.sh

  # Prepare Expo
  npx expo login -u "$FI_EXPO_USERNAME" -p "$FI_EXPO_PASSWORD"
  echo "$FI_GOOGLE_SERVICES_APP" > google-services.json
  DEVELOPER_ENV=${CI_COMMIT_REF_NAME:-"local"}

  # Publish
  echo "Publishing update ..."
  FI_VERSION=$(mobile_get_version basic)
  FI_VERSION_CODE=$(mobile_get_version code)
  sed -i 's/integrates_version/'"${FI_VERSION}"'/g' ./app.json
  sed -i "s/\"versionCode\": 0/\"versionCode\": ${FI_VERSION_CODE}/g" ./app.json

  npx expo publish \
    --release-channel "$DEVELOPER_ENV" \
    --non-interactive

  if [ "${FI_ROLLBAR_ENVIRONMENT}" = 'production' ]; then
    curl https://api.rollbar.com/api/1/deploy/ \
      -F access_token="$ROLLBAR_ACCESS_TOKEN" \
      -F environment='mobile-production' \
      -F revision="$CI_COMMIT_SHA" \
      -F local_username="$CI_COMMIT_REF_NAME"
  fi

  # Cleanup
  echo "Published to Expo, cleaning up..."
  npx expo logout
  rm google-services.json
}

deploy_mobile() {

  # This runs a deploy if mobile/ folder was modified

  # Import functions
  . ci-scripts/helpers/check-changed.sh
  . ci-scripts/helpers/others.sh

  # Logs in to vault in order to run vaultenv
  vault_login

  FOLDERS=(
    'mobile/'
  )

  if check_folder_changed "${FOLDERS[@]}"; then
    cp -a /usr/src/app/node_modules mobile/
    npm install --prefix mobile/
    vaultenv publish_ota
  fi
  echo 'No relevant files for mobile build were modified. Skipping build.'
}

set -e

deploy_mobile
