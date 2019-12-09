#!/usr/bin/env sh

apply_terraform_sops_dev() {

  # Builds terraform plan

  set -e

  # import functions
  . ci-scripts/helpers/terraform.sh

  run_terraform \
    deploy/sops/terraform \
    fluidattacks-terraform-states-dev \
    apply
}

apply_terraform_sops_dev