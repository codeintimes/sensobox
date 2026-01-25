#!/bin/bash
set -e

# Script rápido para configurar todo desde cero

echo "🚀 Quick Setup for Inspections AWS Deployment"
echo "=============================================="
echo ""

# Verificar prerrequisitos
echo "📋 Checking prerequisites..."

command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform is required but not installed. Aborting." >&2; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is required but not installed. Aborting." >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "⚠️  jq is recommended but not installed. Some features may not work."; }

echo "✅ Prerequisites check passed"
echo ""

# Paso 1: Terraform
echo "📦 Step 1: Setting up infrastructure with Terraform..."
cd terraform

if [ ! -f "terraform.tfvars" ]; then
  echo "Creating terraform.tfvars from example..."
  cp terraform.tfvars.example terraform.tfvars
  echo "⚠️  Please edit terraform.tfvars with your values before continuing"
  read -p "Press Enter when ready to continue..."
fi

echo "Initializing Terraform..."
terraform init

echo ""
read -p "Ready to create infrastructure? This will create EC2, S3, and other resources. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

echo "Applying Terraform configuration..."
terraform apply

# Guardar outputs
terraform output -json > outputs.json
BACKEND_IP=$(terraform output -raw backend_elastic_ip)
INSTANCE_ID=$(terraform output -raw backend_instance_id)
BUCKET_NAME=$(terraform output -raw frontend_bucket_name)

echo ""
echo "✅ Infrastructure created!"
echo "   Backend IP: $BACKEND_IP"
echo "   Instance ID: $INSTANCE_ID"
echo "   Frontend Bucket: $BUCKET_NAME"
echo ""

# Paso 2: IAM
echo "🔐 Step 2: Setting up IAM for GitHub Actions..."
cd ../scripts
./setup-iam.sh

echo ""
read -p "Have you added the AWS credentials to GitHub Secrets? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "⚠️  Remember to add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to GitHub Secrets"
fi

# Paso 3: SSH Key
echo ""
echo "🔑 Step 3: Generating SSH key for EC2..."
./generate-ssh-key.sh

echo ""
echo "Copying SSH public key to EC2..."
ssh-copy-id -i ~/.ssh/inspections-backend-deploy-key.pub -o StrictHostKeyChecking=no ubuntu@$BACKEND_IP || {
  echo "⚠️  Could not copy SSH key automatically. Please do it manually:"
  echo "   ssh-copy-id -i ~/.ssh/inspections-backend-deploy-key.pub ubuntu@$BACKEND_IP"
}

# Paso 4: Secrets
echo ""
echo "🔐 Step 4: Setting up AWS Secrets Manager..."
echo "⚠️  You need to create a .env.production file with your environment variables"
read -p "Do you have a .env.production file ready? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ./setup-secrets.sh
else
  echo "⚠️  Skipping secrets setup. Run ./setup-secrets.sh manually later."
fi

# Paso 5: GitHub Secrets
echo ""
echo "📝 Step 5: GitHub Secrets Configuration"
echo "========================================"
echo ""
echo "Add the following secrets to your GitHub repositories:"
echo ""
echo "For codeintimes/inspections-front:"
echo "  - AWS_ACCESS_KEY_ID"
echo "  - AWS_SECRET_ACCESS_KEY"
echo ""
echo "For codeintimes/inspections-back:"
echo "  - AWS_ACCESS_KEY_ID"
echo "  - AWS_SECRET_ACCESS_KEY"
echo "  - EC2_INSTANCE_ID = $INSTANCE_ID"
echo "  - EC2_HOST = $BACKEND_IP"
echo "  - EC2_SSH_PRIVATE_KEY = (content of ~/.ssh/inspections-backend-deploy-key)"
echo ""

# Resumen final
echo "✅ Quick setup completed!"
echo ""
echo "📋 Summary:"
echo "   Backend URL: http://$BACKEND_IP"
echo "   Frontend URL: http://$BUCKET_NAME.s3-website-eu-west-1.amazonaws.com"
echo ""
echo "🔍 Next steps:"
echo "   1. Add GitHub Secrets (see above)"
echo "   2. Push to main/prod branch to trigger deployment"
echo "   3. Run health check: ./scripts/health-check.sh $BACKEND_IP"
echo ""

