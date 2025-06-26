terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.10"
    }
  }
}

provider "google" {
  credentials = file("credentials.json")
  project     = var.gcp_project_id
  region      = var.gcp_region
}

provider "google-beta" {
  project = var.gcp_project_id
  region  = var.gcp_region
}