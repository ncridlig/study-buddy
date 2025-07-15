resource "google_compute_security_policy" "waf_policy" {
  name        = "study-buddy-waf-policy"
  description = "WAF policy to protect against common web attacks."

  # This is a pre-configured rule to block common SQL injection attacks.
  # The action is to deny the request with a 403 Forbidden error.
  rule {
    action   = "deny(403)"
    priority = 1000
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('sqli-stable')"
      }
    }
    description = "Block SQL injection attacks"
  }

  # You must have a default rule with the lowest priority to allow all
  # other traffic that doesn't match a specific rule.
  rule {
    action   = "allow"
    priority = 2147483647
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow rule"
  }
}