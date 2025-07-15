terraform {
  required_version = ">= 1.3.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.10"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.37.1"
    }
  }

  backend "gcs" {
    bucket = "sb-terraform-on-gcp"
    prefix = "dev/k8s"
  }
}
