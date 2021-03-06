variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "region" {
  default = "us-east-1"
}

variable "aws_s3_evidences_bucket" {
  type    = string
  default = "fluidintegrates.evidences"
}

variable "aws_s3_resources_bucket" {
  type    = string
  default = "fluidintegrates.resources"
}

terraform {
  backend "s3" {
    bucket  = "servestf"
    key     = "integrates.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  version    = ">= 2.11"
  region     = var.region
}

module "dynamodb" {
  source = "./dynamodb"
}

module "cloudfront" {
  source                = "./cloudfront"
  bucket_name           = var.aws_s3_resources_bucket
  evidences_bucket_name = var.aws_s3_evidences_bucket
}

module "sqs" {
  source = "./sqs"
}

module "lambda" {
  source = "./lambda"
  sqs_id = module.sqs.sqs_id
}
