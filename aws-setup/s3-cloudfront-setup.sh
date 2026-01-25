#!/bin/bash

# Script para configurar S3 y CloudFront para el frontend

set -e

echo "☁️  Configurando S3 y CloudFront para frontend de Sensobox..."

# Variables
BUCKET_NAME="sensobox-frontend"
REGION="eu-north-1"
DISTRIBUTION_COMMENT="Sensobox Frontend Distribution"

# Crear bucket S3
echo "🪣 Creando bucket S3..."
if ! aws s3 ls "s3://$BUCKET_NAME" 2>/dev/null; then
    if [ "$REGION" == "us-east-1" ]; then
        aws s3 mb s3://$BUCKET_NAME --region $REGION
    else
        aws s3 mb s3://$BUCKET_NAME --region $REGION
    fi
    echo "✅ Bucket creado: $BUCKET_NAME"
else
    echo "✅ Bucket ya existe: $BUCKET_NAME"
fi

# Configurar bucket para hosting estático
echo "⚙️  Configurando bucket para hosting estático..."

# Política de bucket (público para lectura)
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file:///tmp/bucket-policy.json \
  --region $REGION

# Habilitar hosting estático
aws s3 website s3://$BUCKET_NAME/ \
  --index-document index.html \
  --error-document index.html

# Configurar CORS
cat > /tmp/cors-config.json << EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration file:///tmp/cors-config.json \
  --region $REGION

echo "✅ Configuración de bucket completada"

# Crear distribución CloudFront
echo "🌐 Configurando CloudFront..."

# Obtener el backend URL (si existe)
BACKEND_URL=$(grep -E "EC2_HOST|ELASTIC_IP" ../ec2-info.txt 2>/dev/null | grep -oE '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | head -1 || echo "")

# Configuración de CloudFront
cat > /tmp/cloudfront-config.json << EOF
{
  "CallerReference": "sensobox-frontend-$(date +%s)",
  "Comment": "$DISTRIBUTION_COMMENT",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$BUCKET_NAME",
        "DomainName": "${BUCKET_NAME}.s3.${REGION}.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        },
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": {
        "Forward": "none"
      },
      "Headers": {
        "Quantity": 1,
        "Items": ["Origin"]
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF

# Crear distribución
DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution \
  --distribution-config file:///tmp/cloudfront-config.json \
  --query 'Distribution.{Id:Id,DomainName:DomainName,Status:Status}' \
  --output json)

DISTRIBUTION_ID=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Id')
DISTRIBUTION_DOMAIN=$(echo $DISTRIBUTION_OUTPUT | jq -r '.DomainName')

echo "✅ Distribución CloudFront creada: $DISTRIBUTION_ID"
echo "🌐 Domain: $DISTRIBUTION_DOMAIN"

# Guardar información
cat > s3-cloudfront-info.txt << EOF
S3 y CloudFront configurados exitosamente
==========================================
Bucket S3: $BUCKET_NAME
CloudFront Distribution ID: $DISTRIBUTION_ID
CloudFront Domain: $DISTRIBUTION_DOMAIN
Region: $REGION

URL del frontend:
https://$DISTRIBUTION_DOMAIN

Nota: La distribución puede tardar 10-15 minutos en estar completamente activa.

Para actualizar el frontend:
1. Ejecuta: npm run build en sensobox_front/
2. Ejecuta: aws s3 sync build/ s3://$BUCKET_NAME/ --delete
3. Invalida cache: aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

Agrega estos valores a los secrets de GitHub:
- CLOUDFRONT_DISTRIBUTION_ID=$DISTRIBUTION_ID
- S3_BUCKET_FRONTEND=$BUCKET_NAME
EOF

echo ""
echo "📋 Información guardada en: s3-cloudfront-info.txt"
echo ""
echo "🎉 Configuración de S3 y CloudFront completada!"
echo "🌐 Frontend disponible en: https://$DISTRIBUTION_DOMAIN (en 10-15 minutos)"

