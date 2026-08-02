# Terraform Infrastructure Deployment Guide

Nucleus provides native **Terraform Infrastructure as Code (IaC)** templates to provision private VPCs, Security Groups, Subnets, and automated Podman Data Plane deployment instances.

---

## 🏗️ Deploying Nucleus Infrastructure with Terraform

### 1. Prerequisites
Ensure `terraform` CLI (>= 1.5.0) and AWS credentials are configured:

```bash
aws configure
```

---

### 2. Initialize & Plan Terraform

Navigate to the `terraform/` directory:

```bash
cd terraform
terraform init
```

Preview the AWS VPC & Podman host resources:

```bash
terraform plan
```

---

### 3. Provision Infrastructure

Deploy the resources to AWS:

```bash
terraform apply -auto-approve
```

---

### 4. Terraform Outputs

After provisioning completes, Terraform outputs the public IP and Search Portal URL:

```text
Outputs:

dataplane_podman_public_ip = "54.210.42.18"
dataplane_search_portal_url = "http://54.210.42.18:8000/portal"
vpc_id = "vpc-0a8b9c1d2e3f"
```

Access the interactive enterprise search portal at `http://<dataplane_podman_public_ip>:8000/portal`.
