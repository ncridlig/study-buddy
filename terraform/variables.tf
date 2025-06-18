variable "project_id"  { type = string }
variable "region"      { type = string }
variable "github_org"  { type = string }
variable "github_repo" { type = string }

# Optional, only if you plan to use Snyk above:
variable "snyk_token"  { type = string }
