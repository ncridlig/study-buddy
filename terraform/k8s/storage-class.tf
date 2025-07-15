# Resource: Kubernetes Storage Class
resource "kubernetes_storage_class_v1" "gke_sc" {
  metadata {
    name = "${local.name}-gke-pd-standard-rwo-sc"
  }
  storage_provisioner = "pd.csi.storage.gke.io"

  volume_binding_mode = "Immediate"
  # volume_binding_mode = "WaitForFirstConsumer"   # Switch to this one on productions

  allow_volume_expansion = true
  reclaim_policy         = "Retain"
  parameters = {
    type = "pd-ssd"
  }
}