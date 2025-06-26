variable "gcp_project_id" {
  description = "The GCP project ID for the backend (gruppo-11)."
  type        = string
}

variable "gcp_region" {
  description = "The primary GCP region for resources."
  type        = string
}

variable "db_instance_name" {
  description = "db instance name"
  type        = string
}

variable "NAME" {
  description = "DB Name"
  type        = string
}

variable "USER" {
  description = "DB User"
  type        = string
}

variable "PASSWORD" {
  description = "DB Password"
  type        = string
  sensitive   = true
}

variable "DB_TIER" {
  description = "DB Tier"
  type        = string
}