variable "gcp_project_id" {
  description = "The GCP project ID for the backend (gruppo-11)."
  type        = string
}

variable "gcp_region" {
  description = "The primary GCP region for resources."
  type        = string
}

# GCP Compute Engine Machine Type
variable "machine_type" {
  description = "Compute Engine Machine Type"
  type = string
}

# GCP Compute Engine Machine Type
variable "gpu_machine_type" {
  description = "Compute Engine GPU Machine Type"
  type = string
}

# variable "db_instance_name" {
#   description = "db instance name"
#   type        = string
# }

# variable "NAME" {
#   description = "DB Name"
#   type        = string
# }

# variable "USER" {
#   description = "DB User"
#   type        = string
# }

# variable "PASSWORD" {
#   description = "DB Password"
#   type        = string
#   sensitive   = true
# }

# variable "DB_TIER" {
#   description = "DB Tier"
#   type        = string
# }


######## USED FOR LOCAL ########
# Environment Variable
variable "environment" {
  description = "Environment Variable used as a prefix"
  type = string
  default = "dev"  # Developement
}

# Business Division
variable "business_divsion" {
  description = "Business Division in the large organization this Infrastructure belongs"
  type = string
  default = "sap"  # Systems, Applications & Products
}
#################################


######## BUCKET NAMES ########
variable "static_bucket_name" {
  description = "Bucket for static files"
  type        = string
  default     = "static-volume"
}

variable "media_bucket_name" {
  description = "Bucket for media files"
  type        = string
  default     = "media-volume"
}
#################################

variable "frontend_bucket_name" {
  description = "Bucket for frontend files"
  type        = string
  default     = "frontend-volume"
}
