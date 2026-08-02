output "vpc_id" {
  value       = aws_vpc.nucleus_vpc.id
  description = "Nucleus Enterprise VPC ID"
}

output "dataplane_podman_public_ip" {
  value       = aws_instance.podman_dataplane_host.public_ip
  description = "Public IP address of the Podman Data Plane Gateway host"
}

output "dataplane_search_portal_url" {
  value       = "http://${aws_instance.podman_dataplane_host.public_ip}:8000/portal"
  description = "URL of the interactive Glean-style Search Portal"
}
