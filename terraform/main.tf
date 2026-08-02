terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# --- VPC & Networking ---

resource "aws_vpc" "nucleus_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "nucleus-enterprise-vpc"
    Environment = var.environment
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.nucleus_vpc.id
  cidr_block              = var.public_subnet_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "nucleus-public-subnet"
  }
}

resource "aws_subnet" "private_subnet" {
  vpc_id            = aws_vpc.nucleus_vpc.id
  cidr_block        = var.private_subnet_cidr
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "nucleus-private-subnet"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.nucleus_vpc.id

  tags = {
    Name = "nucleus-igw"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.nucleus_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "nucleus-public-rt"
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# --- Security Groups ---

resource "aws_security_group" "data_plane_sg" {
  name        = "nucleus-data-plane-sg"
  description = "Security group for Podman-hosted Nucleus Data Plane Gateway"
  vpc_id      = aws_vpc.nucleus_vpc.id

  ingress {
    description = "HTTPS API Access"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP Search Portal"
    from_port   = 8000
    to_port     = 8000
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- Podman Host EC2 Instance ---

resource "aws_instance" "podman_dataplane_host" {
  ami           = var.ec2_ami_id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public_subnet.id

  vpc_security_group_ids = [aws_security_group.data_plane_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y podman podman-compose git
              systemctl enable --now podman
              
              # Clone & Run Nucleus Data Plane via Podman
              mkdir -p /opt/nucleus
              cd /opt/nucleus
              git clone https://github.com/nucleus-ai/nucleus-search-engine.git .
              podman-compose up -d
              EOF

  tags = {
    Name        = "nucleus-dataplane-podman-host"
    Environment = var.environment
  }
}
