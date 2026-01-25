terraform {
  required_version = ">= 1.0"
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

# Data source para obtener la VPC por defecto
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security Group para el backend EC2
resource "aws_security_group" "backend_sg" {
  name        = "inspections-backend-sg"
  description = "Security group for inspections backend EC2"

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend API"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "inspections-backend-sg"
  }
}

# Elastic IP para el backend
resource "aws_eip" "backend_eip" {
  domain = "vpc"
  tags = {
    Name = "inspections-backend-eip"
  }
}

# IAM Role para el EC2 backend
resource "aws_iam_role" "ec2_backend_role" {
  name = "inspections-backend-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "inspections-backend-ec2-role"
  }
}

# IAM Policy para acceso a S3, Secrets Manager, etc.
resource "aws_iam_role_policy" "ec2_backend_policy" {
  name = "inspections-backend-ec2-policy"
  role = aws_iam_role.ec2_backend_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.frontend_bucket.arn,
          "${aws_s3_bucket.frontend_bucket.arn}/*",
          aws_s3_bucket.backend_assets.arn,
          "${aws_s3_bucket.backend_assets.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "ec2_backend_profile" {
  name = "inspections-backend-ec2-profile"
  role = aws_iam_role.ec2_backend_role.name
}

# Key Pair (necesitarás crear la clave manualmente o usar una existente)
# resource "aws_key_pair" "backend_key" {
#   key_name   = "inspections-backend-key"
#   public_key = file("~/.ssh/id_rsa.pub")
# }

# EC2 Instance para el backend
resource "aws_instance" "backend" {
  ami                    = var.ami_id != "" ? var.ami_id : data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.backend_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_backend_profile.name
  user_data              = base64encode(templatefile("${path.module}/user-data-backend.sh", {
    s3_bucket = aws_s3_bucket.backend_assets.id
  }))

  tags = {
    Name = "inspections-backend"
  }
}

# Asociar Elastic IP al EC2
resource "aws_eip_association" "backend_eip_assoc" {
  instance_id   = aws_instance.backend.id
  allocation_id = aws_eip.backend_eip.id
}

# Data source para obtener la AMI de Ubuntu más reciente
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# S3 Bucket para el frontend
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = var.frontend_bucket_name

  tags = {
    Name = "inspections-frontend"
  }
}

resource "aws_s3_bucket_website_configuration" "frontend_bucket_website" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_bucket_pab" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false

  depends_on = [aws_s3_bucket.frontend_bucket]
}

resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend_bucket.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.frontend_bucket_pab]
}

# S3 Bucket para assets del backend (opcional)
resource "aws_s3_bucket" "backend_assets" {
  bucket = var.backend_assets_bucket_name

  tags = {
    Name = "inspections-backend-assets"
  }
}

# CloudFront Distribution para el frontend (opcional, más costoso pero mejor rendimiento)
# Comentado por ahora para mantener costos bajos
# resource "aws_cloudfront_distribution" "frontend_distribution" {
#   origin {
#     domain_name = aws_s3_bucket_website_configuration.frontend_bucket_website.website_endpoint
#     origin_id   = "S3-${aws_s3_bucket.frontend_bucket.id}"
#     custom_origin_config {
#       http_port              = 80
#       https_port             = 443
#       origin_protocol_policy = "http-only"
#     }
#   }

#   enabled             = true
#   is_ipv6_enabled     = true
#   default_root_object = "index.html"

#   default_cache_behavior {
#     allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
#     cached_methods   = ["GET", "HEAD"]
#     target_origin_id = "S3-${aws_s3_bucket.frontend_bucket.id}"

#     forwarded_values {
#       query_string = false
#       cookies {
#         forward = "none"
#       }
#     }

#     viewer_protocol_policy = "redirect-to-https"
#     min_ttl                = 0
#     default_ttl            = 3600
#     max_ttl                = 86400
#   }

#   restrictions {
#     geo_restriction {
#       restriction_type = "none"
#     }
#   }

#   viewer_certificate {
#     cloudfront_default_certificate = true
#   }
# }

# Outputs
output "backend_elastic_ip" {
  value       = aws_eip.backend_eip.public_ip
  description = "Elastic IP address of the backend EC2 instance"
}

output "backend_instance_id" {
  value       = aws_instance.backend.id
  description = "Instance ID of the backend EC2"
}

output "frontend_bucket_name" {
  value       = aws_s3_bucket.frontend_bucket.id
  description = "Name of the S3 bucket for frontend"
}

output "frontend_website_url" {
  value       = "http://${aws_s3_bucket.frontend_bucket.id}.s3-website-${var.aws_region}.amazonaws.com"
  description = "URL of the frontend S3 website"
}

# output "frontend_cloudfront_url" {
#   value       = "https://${aws_cloudfront_distribution.frontend_distribution.domain_name}"
#   description = "CloudFront URL for the frontend"
# }

