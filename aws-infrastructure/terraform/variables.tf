variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "frontend_bucket_name" {
  description = "Name of the S3 bucket for frontend"
  type        = string
  default     = "inspections-frontend-codeintimes"
}

variable "backend_assets_bucket_name" {
  description = "Name of the S3 bucket for backend assets"
  type        = string
  default     = "inspections-backend-assets-codeintimes"
}

variable "ami_id" {
  description = "AMI ID for EC2 instance (leave empty to use latest Ubuntu)"
  type        = string
  default     = ""
}

variable "github_repo_frontend" {
  description = "GitHub repository for frontend (org/repo)"
  type        = string
  default     = "codeintimes/inspections-front"
}

variable "github_repo_backend" {
  description = "GitHub repository for backend (org/repo)"
  type        = string
  default     = "codeintimes/inspections-back"
}

