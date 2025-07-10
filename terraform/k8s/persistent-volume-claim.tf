# Resource: Persistent Volume Claim
resource "kubernetes_persistent_volume_claim_v1" "rd1_pvc" {
    metadata {
        name = "${local.name}-gke-pd-rd1-pv-claim"
    }
    spec {
        access_modes = ["ReadWriteOnce"]
        storage_class_name = kubernetes_storage_class_v1.gke_sc.metadata.0.name 
        resources {
            requests = {
                storage = "4Gi"
            }
        }
    }
}

output "rd1_pvc_name" {
    value = kubernetes_persistent_volume_claim_v1.rd1_pvc.metadata[0].name
}