# Resource: Google-Managed Certificate for the domain
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
        "study-buddy.duckdns.org", # Fully qualified domain name
      ]
    }
  }
}


# Kubernetes Ingress
# The central piece that routes external traffic to your service
# and attaches the SSL certificate.
resource "kubernetes_ingress_v1" "nginx_ingress" {
  metadata {
    name = "nginx-ingress"
    namespace = "default"
    annotations = {
      # Use the GCE (Google Cloud) Ingress controller.
      "kubernetes.io/ingress.class" = "gce"
      # Use the static IP you have already reserved.
      "kubernetes.io/ingress.global-static-ip-name" = "35.195.39.220"
      # Attach the managed certificate by name.
      "networking.gke.io/managed-certificates" = kubernetes_manifest.managed_cert.manifest.metadata.name
      "ingress.kubernetes.io/ssl-redirect"          = "false"
    }
  }

  spec {
    default_backend {
      service {
        name = kubernetes_service_v1.nginx.metadata[0].name
        port {
          number = 80
        }
      }
    }
  }
}