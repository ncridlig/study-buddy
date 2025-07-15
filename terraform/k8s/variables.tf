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
  type        = string
}

variable "DB_VERSION" {
  description = "DB VERSION"
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


######## USED FOR LOCAL ########
# Environment Variable
variable "environment" {
  description = "Environment Variable used as a prefix"
  type        = string
  default     = "dev" # Developement
}

# Business Division
variable "business_divsion" {
  description = "Business Division in the large organization this Infrastructure belongs"
  type        = string
  default     = "sap" # Systems, Applications & Products
}
#################################



######## USED FOR BACKEND ########
variable "SECRET_KEY" {
  description = "Django secret key"
  type        = string
  sensitive   = true
}

variable "DEBUG" {
  description = "Enable debug mode (True/False)"
  type        = string
}

variable "HOST" {
  description = "Database host"
  type        = string
}

variable "PORT" {
  description = "Database port"
  type        = string
}

variable "REDIS_HOST" {
  description = "Redis hostname"
  type        = string
}

variable "DJANGO_SUPERUSER_EMAIL" {
  type        = string
  description = "Django superuser email"
}

variable "DJANGO_SUPERUSER_FIRSTNAME" {
  type        = string
  description = "Django superuser first name"
}

variable "DJANGO_SUPERUSER_LASTNAME" {
  type        = string
  description = "Django superuser last name"
}

variable "DJANGO_SUPERUSER_PASSWORD" {
  type        = string
  description = "Django superuser password"
  sensitive   = true
}

variable "DJANGO_SETTINGS_MODULE" {
  type        = string
  description = "Python settings module to use"
}

variable "ALLOWED_HOSTS" {
  type        = string
  description = "Django ALLOWED_HOSTS setting"
}

variable "ALLOWED_ORIGINS" {
  type        = string
  description = "CORS ALLOWED_ORIGINS setting"
}

variable "LLM_SERVICE_URL" {
  type        = string
  description = "URL for LLM service"
}

variable "CSRF_TRUSTED_ORIGINS" {
  type        = string
  description = "CSRF trusted origins"
}
#################################


######## USED FOR BACKEND (RELATED TO GCP) ########
variable "ON_CLOUD" {
  description = "The App is on Cloud or Local"
  type        = string
}

variable "GS_BUCKET_STATIC_NAME" {
  description = "Staticfiles Bucket Name"
  type        = string
}

variable "GS_BUCKET_MEDIA_NAME" {
  description = "Media Bucket Name"
  type        = string
}

# variable "GOOGLE_APPLICATION_CREDENTIALS" {
#     description = "Credentials"
#     type        = string
# }
#################################


######## USED FOR LLM ########
variable "REDIS_HOST_LLM" {
  description = "Redis hostname for LLM"
  type        = string
}

variable "BACKEND_URL" {
  description = "Backend callback URL for LLM results"
  type        = string
}

variable "ASYNC_JOB_MAX_RETRIES" {
  description = "Max retries for async jobs"
  type        = string
}

variable "ASYNC_JOB_RETRY_DELAY" {
  description = "Retry delay for async jobs (seconds)"
  type        = string
}

variable "ASYNC_JOB_TIMEOUT" {
  description = "Timeout for async jobs (seconds)"
  type        = string
}

variable "MARK_LEFTOVER_RESULT_KEY" {
  description = "Key for leftover results"
  type        = string
}

variable "MARK_DANGLING_RESULT_KEY" {
  description = "Key for dangling results"
  type        = string
}

variable "STUDY_FRIEND_CUDA" {
  description = "Enable CUDA for study friend (1 to enable)"
  type        = string
}
#################################

######## USED FOR Frontend ########
variable "NEXT_PUBLIC_API_URL" {
  description = "For the frontend to send API calls to the backend"
  type        = string
}
#################################

