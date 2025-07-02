output "frontend_url" {
  description = "The publicly accessible URL of the frontend service."
  value       = google_cloud_run_v2_service.frontend.uri
}

output "backend_service_name" {
  description = "The name of the internal backend service."
  value       = google_cloud_run_v2_service.backend.name
}

output "llm_service_name" {
  description = "The name of the internal llm service."
  value       = google_cloud_run_v2_service.llm_service.name
}