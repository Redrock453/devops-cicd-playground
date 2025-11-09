# Terraform configuration for DevOps CI/CD Playground on GCP

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Backend для хранения состояния в GCS (будет настроен в CI/CD)
  backend "gcs" {
    bucket = "devops-cicd-terraform-state" # <-- Замените на имя вашего bucket
    prefix = "terraform/state"
  }
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "europe-west3"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "europe-west3-a"
}

variable "machine_type" {
  description = "GCE machine type"
  type        = string
  default     = "e2-medium"
}

# VPC Network
resource "google_compute_network" "vpc_network" {
  name                    = "devops-cicd-network"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "devops-cicd-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc_network.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/16"
  }
}

# Firewall rules
resource "google_compute_firewall" "allow_http" {
  name    = "devops-cicd-allow-http"
  network = google_compute_network.vpc_network.id

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server"]
}

resource "google_compute_firewall" "allow_https" {
  name    = "devops-cicd-allow-https"
  network = google_compute_network.vpc_network.id

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["https-server"]
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "devops-cicd-allow-ssh"
  network = google_compute_network.vpc_network.id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ssh"]
}

# Compute Engine VM Instance
resource "google_compute_instance" "vm_instance" {
  name         = "devops-cicd-instance"
  machine_type = var.machine_type
  zone         = var.zone

  tags = ["http-server", "https-server", "ssh"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 20
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.subnet.id
    access_config {
      # Ephemeral public IP
    }
  }

  metadata = {
    ssh-keys = "ubuntu:${file(var.public_key_path)}"
  }

  metadata_startup_script = file("${path.module}/scripts/startup.sh")
}

# Static external IP address
resource "google_compute_address" "static_ip" {
  name = "devops-cicd-static-ip"
}

# Output values
output "instance_name" {
  description = "GCE instance name"
  value       = google_compute_instance.vm_instance.name
}

output "external_ip" {
  description = "External IP address of the instance"
  value       = google_compute_address.static_ip.address
}

output "instance_zone" {
  description = "GCE instance zone"
  value       = google_compute_instance.vm_instance.zone
}