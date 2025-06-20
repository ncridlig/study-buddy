terraform {
  backend "gcs" {
    bucket = "study-buddy-tf-state-study-buddy-frontend"
    prefix = "study-buddy/prod"
  }
}