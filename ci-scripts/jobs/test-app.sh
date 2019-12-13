#!/usr/bin/env bash

# Runs unit tests on app

provision_mock () {
    service redis-server start

    aws configure set aws_access_key_id ${FI_AWS_DYNAMODB_ACCESS_KEY}
    aws configure set aws_secret_access_key ${FI_AWS_DYNAMODB_SECRET_KEY}
    aws configure set region us-east-1

    java -Djava.library.path=/usr/local/lib/dynamodb-local/DynamoDBLocal_lib \
        -jar /usr/local/lib/dynamodb-local/DynamoDBLocal.jar \
        -sharedDb \
        -port 8022 &
    DYNAMODB_PROCESS=$!
    . deploy/containers/common/vars/provision_local_db.sh
}

teardown () {
    kill -9 $DYNAMODB_PROCESS || true
    rm -f shared-local-instance.db
}

run_unit_test () {
    # Unit tests
    rm -rf /usr/src/app_src
    cp -a "$PWD" /usr/src/app_src
    cd /usr/src/app_src || return 1
    mkdir -p build/test
    pytest \
    --ds=fluidintegrates.settings \
    -n auto \
    --dist=loadscope \
    --verbose \
    --maxfail=20 \
    --cov=fluidintegrates \
    --cov=app \
    --cov=/usr/local/lib/python$(python3 -c "import sys;print(f'{sys.version_info.major}.{sys.version_info.minor}')")/dist-packages/backend/ \
    --cov-report term \
    --cov-report html:build/coverage/html \
    --cov-report xml:build/coverage/results.xml \
    --cov-report annotate:build/coverage/annotate \
    --basetemp=build/test \
    --junitxml=build/test/results.xml \
    app/test/
    RETVAL=$?
    cp -a build/coverage/results.xml "$CI_PROJECT_DIR/coverage.xml"

    cd "$CI_PROJECT_DIR" || RETVAL=1
    teardown
    return $RETVAL
}

provision_mock
run_unit_test || exit 1
