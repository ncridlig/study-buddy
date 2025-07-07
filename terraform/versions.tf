terraform {
  required_version = ">= 1.3.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.10"
    }
  }

  backend "gcs" {
    bucket = "sb-terraform-on-gcp"
    prefix = "dev/gke-public-cluster"
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