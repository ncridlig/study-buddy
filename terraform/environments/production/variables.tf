variable "gcp_project_id" {
  description = "The GCP project ID."
  type        = string
  default     = "gruppo-11"
}

variable "gcp_region" {
  description = "The GCP region for resources."
  type        = string
  default     = "europe-west1" # Milan, Italy
}

variable "frontend_image_tag" {
  description = "The Docker image tag for the frontend service."
  type        = string
}

variable "backend_image_tag" {
  description = "The Docker image tag for the backend service."
  type        = string
}

variable "llm_service_image_tag" {
  description = "The Docker image tag for the llm-service."
  type        = string
}