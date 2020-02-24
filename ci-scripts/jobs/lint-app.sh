#!/usr/bin/env bash

# Runs linters on app

# Linters
run_lint () {
    RETVAL=0
    prospector -F -s high -u django -i node_modules app/ || RETVAL=1
    prospector -F -s high -u django -i node_modules django-apps/ || RETVAL=1
    prospector -F -s veryhigh -u django -i node_modules fluidintegrates/ || RETVAL=1
    prospector -F -s veryhigh lambda/ || RETVAL=1
    mypy django-apps/integrates-back/backend/utils/cvss.py || RETVAL=1
    return $RETVAL
}

run_lint || exit 1
