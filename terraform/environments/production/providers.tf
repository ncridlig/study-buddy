# Configure Terraform settings
terraform {
  required_version = ">= 1.0"

  # Define the Google Cloud provider
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.50.0"
    }
  }

  # Configure the GCS backend for remote state storage
  backend "gcs" {
    bucket = "terraform-state-study-buddy-gruppo-11"
    prefix = "terraform/state"
  }
}

# Configure the Google provider with project and region details
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}