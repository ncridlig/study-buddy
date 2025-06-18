terraform {
  required_version = ">= 1.5"
  backend "gcs" {
    bucket = "study-buddy-tfstate"   # ← your GCS bucket for state
    prefix = "frontend-cicd"
  }
}
