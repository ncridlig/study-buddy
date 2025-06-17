variable "service_name" {
  type    = string
  default = "study-buddy-frontend-public"
}

variable "region" {
  type    = string
  default = "europe-west1"
}

variable "image" {
  type        = string
  description = "Docker image path from Artifact Registry"
}
