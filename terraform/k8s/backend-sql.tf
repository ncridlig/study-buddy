resource "google_sql_database_instance" "main" {
  name                = "${local.name}-postgresql"
  database_version    = var.DB_VERSION
  project             = var.gcp_project_id
  region              = var.gcp_region
  deletion_protection = false

  settings {
    # tier    = "db-f1-micro"
    # availability_type = "ZONAL"

    #### HA(high availability) and replication ####
    tier              = "db-g1-small"
    availability_type = "REGIONAL"
    ###############################################

    edition               = "ENTERPRISE"
    disk_autoresize       = true
    disk_autoresize_limit = 20
    disk_size             = 10
    disk_type             = "PD_SSD"

    backup_configuration {
      enabled = true
      # binary_log_enabled = true  # only for MySQL
    }

    # TODO: Need to be update to Private IP DB
    ip_configuration {
      ipv4_enabled = true

      authorized_networks {
        name  = "all-access"
        value = "0.0.0.0/0"
      }
    }
  }
}

resource "google_sql_database" "backend" {
  name     = var.NAME
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "users" {
  name     = var.USER
  instance = google_sql_database_instance.main.name
  password = var.PASSWORD
}

output "mydb_schema" {
  value = google_sql_database.backend.name
}

output "mydb_user" {
  value = google_sql_user.users.name
}

output "mydb_password" {
  value     = google_sql_user.users.password
  sensitive = true
}


