resource "google_sql_database_instance" "main" {
  name             = var.db_instance_name
  database_version = "POSTGRES_15"
  region           = var.gcp_region

  settings {
    tier = var.DB_TIER
    backup_configuration {
      enabled = true
    }
    ip_configuration {
      ipv4_enabled    = true
      require_ssl     = false
      authorized_networks {
        name  = "all-access"
        value = "0.0.0.0/0"
      }
    }
  }
}

resource "google_sql_user" "backend" {
  name     = var.USER
  instance = google_sql_database_instance.main.name
  password = var.PASSWORD
}

resource "google_sql_database" "backend" {
  name     = var.NAME
  instance = google_sql_database_instance.main.name
}
