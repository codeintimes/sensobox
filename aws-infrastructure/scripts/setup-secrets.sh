#!/bin/bash
set -e

# Script para configurar AWS Secrets Manager con las variables de entorno del backend

AWS_REGION=${AWS_REGION:-eu-west-1}
SECRET_NAME="inspections-backend-env"

echo "🔐 Setting up AWS Secrets Manager for backend environment variables..."

# Leer variables de entorno desde un archivo .env o pedirlas interactivamente
if [ -f ".env.production" ]; then
  echo "Reading from .env.production..."
  source .env.production
elif [ -f "../inspections-back/.env.production" ]; then
  echo "Reading from ../inspections-back/.env.production..."
  source ../inspections-back/.env.production
else
  echo "⚠️  No .env.production file found. Please provide environment variables:"
  read -p "MONGO_URI: " MONGO_URI
  read -p "JWT_SECRET: " JWT_SECRET
  read -p "TESSERACT_HOST: " TESSERACT_HOST
  read -p "TESSERACT_PORT: " TESSERACT_PORT
  read -p "TESSERACT_USER: " TESSERACT_USER
  read -p "TESSERACT_PASS: " TESSERACT_PASS
  read -p "TESSERACT_DB: " TESSERACT_DB
  read -p "AWS_S3_BUCKET_NAME: " AWS_S3_BUCKET_NAME
  read -p "REDIS_URL (optional): " REDIS_URL
fi

# Crear JSON con las variables de entorno
cat > /tmp/secrets.json <<EOF
{
  "MONGO_URI": "${MONGO_URI}",
  "JWT_SECRET": "${JWT_SECRET}",
  "TESSERACT_HOST": "${TESSERACT_HOST}",
  "TESSERACT_PORT": "${TESSERACT_PORT}",
  "TESSERACT_USER": "${TESSERACT_USER}",
  "TESSERACT_PASS": "${TESSERACT_PASS}",
  "TESSERACT_DB": "${TESSERACT_DB}",
  "AWS_S3_BUCKET_NAME": "${AWS_S3_BUCKET_NAME}",
  "AWS_S3_REGION": "${AWS_REGION}",
  "NODE_ENV": "production",
  "PORT": "3000",
  "ALLOWED_ORIGINS": "*",
  "REDIS_URL": "${REDIS_URL:-}",
  "INTERNAL_API_KEY": "${INTERNAL_API_KEY:-brrbrrpatapim88}"
}
EOF

# Crear o actualizar el secreto
if aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $AWS_REGION >/dev/null 2>&1; then
  echo "Updating existing secret..."
  aws secretsmanager update-secret \
    --secret-id $SECRET_NAME \
    --secret-string file:///tmp/secrets.json \
    --region $AWS_REGION
else
  echo "Creating new secret..."
  aws secretsmanager create-secret \
    --name $SECRET_NAME \
    --secret-string file:///tmp/secrets.json \
    --region $AWS_REGION
fi

echo ""
echo "✅ Secret created/updated: $SECRET_NAME"
echo ""
echo "📝 To retrieve the secret on EC2, use:"
echo "   aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region $AWS_REGION --query SecretString --output text | jq -r 'to_entries[] | \"export \(.key)=\\(.value)\"'"
echo ""

# Cleanup
rm -f /tmp/secrets.json

