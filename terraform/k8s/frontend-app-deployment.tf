# This file defines the Kubernetes resources for the frontend application.
# It includes a Deployment, a Service, and a Horizontal Pod Autoscaler.

# Resource: Kubernetes Deployment for the Frontend Application
# This manages the pods that run your frontend container.
resource "kubernetes_deployment_v1" "frontend" {
  metadata {
    name = "frontend"
    labels = {
      app = "frontend"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "frontend"
        }
      }

      spec {
        # This links the pod to the Kubernetes Service Account, which is configured
        # for Workload Identity. This gives the pod secure access to GCP services.
        service_account_name = kubernetes_service_account.frontend_k8s_sa.metadata[0].name

        container {
          name  = "frontend"
          # IMPORTANT: Replace this with the correct path to your frontend Docker image.
          image = "europe-west1-docker.pkg.dev/gruppo-11/study-buddy-repo/frontend:latest"

          # This block loads environment variables from the specified Kubernetes secret.
          # It's the standard way to inject configuration like API URLs into your application.
          env_from {
            secret_ref {
              name = "frontend-env"
            }
          }

          port {
            # The port your frontend application listens on inside the container.
            # Common ports are 3000 (for Node.js), 80 (for Nginx/Apache), or 5000.
            container_port = 3000
          }

          # Many frontend containers (like those built with create-react-app or nginx)
          # have their own entrypoint, so 'command' and 'args' are often not needed.
          # Uncomment and modify if your container requires a specific command to start.
          # command = ["/bin/sh", "-c"]
          # args = ["npm start"]

          resources {
            # Resource requests should be the typical amount your app needs to run.
            requests = {
              cpu    = "100m"  # 10% of a CPU core
              memory = "128Mi" # 128 Mebibytes
            }

            # Limits prevent a single pod from consuming too many resources.
            limits = {
              cpu    = "500m"  # 50% of a CPU core
              memory = "512Mi" # 512 Mebibytes
            }
          }

          # Liveness and Readiness probes are highly recommended for production deployments
          # to ensure traffic is only sent to healthy pods.
          readiness_probe {
            http_get {
              path = "/" # Your app's root path or a specific health check endpoint
              port = 3000
            }
            initial_delay_seconds = 5
            period_seconds      = 10
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 3000
            }
            initial_delay_seconds = 15
            period_seconds      = 20
          }
        }
      }
    }
  }
}

# FOR DEV
# This exposes your frontend application to the internet via a GCP Load Balancer.
resource "kubernetes_service_v1" "frontend" {
  metadata {
    name = "frontend"
  }

  spec {
    selector = {
      app = "frontend"
    }

    port {
      protocol    = "TCP"
      port        = 80 # The standard HTTP port the world will connect to.
      target_port = 3000 # The port on your container to forward traffic to.
    }

    # Type "LoadBalancer" tells GCP to create an external load balancer
    # with a public IP address to route traffic to your pods.
    type = "LoadBalancer"
  }
}

# FOR PROD
resource "kubernetes_service_v1" "frontend_internal" {
  metadata {
    name = "frontend-internal"
  }

  spec {
    selector = {
      app = "frontend"
    }

    port {
      protocol    = "TCP"
      port        = 80 
      target_port = 3000 
    }

    type = "NodePort"
  }
}

# Resource: Horizontal Pod Autoscaler V2
# This automatically scales the number of frontend pods based on CPU and memory usage.
resource "kubernetes_horizontal_pod_autoscaler_v2" "frontend_hpa" {
  metadata {
    name = "frontend-hpa"
  }

  spec {
    min_replicas = 1
    max_replicas = 15 # Set a max to control costs

    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment_v1.frontend.metadata[0].name
    }

    # Scale up if CPU usage across all pods averages over 70%
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

    # Scale up if memory usage across all pods averages over 75%
    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type                = "Utilization"
          average_utilization = 75
        }
      }
    }
  }
}
