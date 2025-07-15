# Provision an IP address (move this to infrastructure)
resource "google_compute_global_address" "ingress_static_ip" {
  name = "study-buddy-ingress-static-ip"
}

# Resource: Google-Managed Certificate for the domain (move this to infra but takes one hour)
# This tells GKE to automatically provision and renew an SSL certificate.
resource "kubernetes_manifest" "managed_cert" {
  manifest = {
    "apiVersion" = "networking.gke.io/v1"
    "kind"       = "ManagedCertificate"
    "metadata" = {
      "name" = "study-buddy-cert"
      "namespace" = "default"
    }
    "spec" = {
      "domains" = [
        "study-buddy.duckdns.org", # Can add more than 1 domain
      ]
    }
  }
}


# Kubernetes Ingress
# The central piece that routes external traffic to your service
# and attaches the SSL certificate.
resource "kubernetes_ingress_v1" "ingress" {
  metadata {
    name = "ingress"
    namespace = "default"
    annotations = {
      # Use the GCE (Google Cloud) Ingress controller. (get it from remote datasource)
      "kubernetes.io/ingress.class" = "gce"
      # Use the static IP you have already reserved.
      "kubernetes.io/ingress.global-static-ip-name" = google_compute_global_address.ingress_static_ip.name
      # Attach the managed certificate by name. (get it from remote datasource)
      "networking.gke.io/managed-certificates" = kubernetes_manifest.managed_cert.manifest.metadata.name
      "ingress.kubernetes.io/ssl-redirect"          = "false"
    }
  }

  spec {
    default_backend {
      service {
        name = kubernetes_service_v1.frontend_internal.metadata[0].name
        port {
          number = 80
        }
      }
    }

    rule {
      http {
        path {
          path = "/docs/"
          path_type = "Exact"
          backend {
            service {
              name = kubernetes_service_v1.backend_internal.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
        path {
          path = "/admin/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.backend_internal.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
        path {
          path = "/api/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.backend_internal.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}