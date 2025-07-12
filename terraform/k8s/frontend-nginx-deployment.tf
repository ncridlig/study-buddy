# This file defines the Kubernetes resources for the frontend's Nginx reverse proxy.
# This version assumes the Docker image is pre-built with all static files included.

resource "kubernetes_deployment_v1" "frontend_nginx" {
  metadata {
    name = "frontend-nginx"
    labels = {
      app = "frontend-nginx"
    }
  }

  spec {
    replicas = 2 # Start with 2 replicas for high availability

    selector {
      match_labels = {
        app = "frontend-nginx"
      }
    }

    template {
      metadata {
        labels = {
          app = "frontend-nginx"
        }
      }

      spec {
        # Use the frontend's Kubernetes Service Account
        service_account_name = kubernetes_service_account.frontend_k8s_sa.metadata[0].name

        # This volume uses the ConfigMap to inject the Nginx configuration.
        volume {
          name = "nginx-config-frontend"
          config_map {
            name = kubernetes_config_map_v1.frontend_nginx_config.metadata[0].name
          }
        }

        # This is the main application container. There is no longer an init_container
        # for building the application.
        container {
          name  = "nginx"
          
          # IMPORTANT: This Docker image must now be a multi-stage build that contains
          # both Nginx and your pre-built static frontend files (from 'npm run build').
          image = "europe-west1-docker.pkg.dev/gruppo-11/study-buddy-repo/frontend-web:latest"

          port {
            container_port = 80
          }

          # Mount the Nginx configuration file.
          volume_mount {
            name       = "nginx-config-frontend"
            mount_path = "/etc/nginx/nginx.conf"
            sub_path   = "nginx.conf"
            read_only  = true
          }
          # NOTE: The volume mount for static files is removed because the files
          # are now expected to be part of the Docker image itself, typically located
          # at /usr/share/nginx/html, which is the default Nginx root.

          resources {
            requests = {
              cpu    = "100m"
              memory = "64Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "256Mi"
            }
          }
        }
      }
    }
  }
}

# This service exposes the Nginx deployment to the internet via a Load Balancer.
resource "kubernetes_service_v1" "frontend_nginx_service" {
  metadata {
    name = "frontend-nginx-service"
  }

  spec {
    selector = {
      app = "frontend-nginx"
    }

    type = "LoadBalancer"

    port {
      protocol    = "TCP"
      port        = 80   # Expose standard HTTP port 80 to the world
      target_port = 80   # Route traffic to port 80 on the Nginx container
    }
  }
}

# This HPA automatically scales the Nginx pods based on CPU load.
resource "kubernetes_horizontal_pod_autoscaler_v2" "frontend_nginx_hpa" {
  metadata {
    name = "frontend-nginx-hpa"
  }

  spec {
    min_replicas = 2
    max_replicas = 10

    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment_v1.frontend_nginx.metadata[0].name
    }
    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }
  }
}
