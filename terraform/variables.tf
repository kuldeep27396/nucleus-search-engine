variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region for VPC deployment"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "VPC CIDR block"
}

variable "public_subnet_cidr" {
  type        = string
  default     = "10.0.1.0/24"
  description = "Public subnet CIDR block"
}

variable "private_subnet_cidr" {
  type        = string
  default     = "10.0.2.0/24"
  description = "Private subnet CIDR block"
}

variable "instance_type" {
  type        = string
  default     = "t3.large"
  description = "EC2 instance size for Podman host"
}

variable "ec2_ami_id" {
  type        = string
  default     = "ami-0c7217cdde317cfec" # Red Hat Enterprise Linux / Amazon Linux 2023 with Podman
  description = "AMI ID for Podman host"
}
