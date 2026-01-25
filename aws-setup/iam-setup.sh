#!/bin/bash

# Script para configurar IAM roles y políticas necesarias para el deployment

set -e

echo "🔐 Configurando IAM para deployment de Sensobox..."

# Variables
POLICY_NAME="SensoboxDeploymentPolicy"
ROLE_NAME="SensoboxDeploymentRole"
GITHUB_OIDC_PROVIDER_ARN=""

# Crear política para deployment
echo "📝 Creando política IAM para deployment..."

cat > /tmp/deployment-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:RebootInstances",
        "ec2:DescribeInstanceStatus"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::sensobox-frontend",
        "arn:aws:s3:::sensobox-frontend/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:AllocateAddress",
        "ec2:AssociateAddress",
        "ec2:DescribeAddresses",
        "ec2:ReleaseAddress"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Crear la política
aws iam create-policy \
  --policy-name $POLICY_NAME \
  --policy-document file:///tmp/deployment-policy.json \
  --description "Política para deployment de Sensobox en AWS" \
  2>/dev/null || echo "⚠️  La política ya existe, continuando..."

POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text)

echo "✅ Política creada: $POLICY_ARN"

# Adjuntar política al usuario actual
CURRENT_USER=$(aws sts get-caller-identity --query User.UserName --output text)
echo "👤 Adjuntando política al usuario: $CURRENT_USER"

aws iam attach-user-policy \
  --user-name $CURRENT_USER \
  --policy-arn $POLICY_ARN \
  2>/dev/null || echo "⚠️  La política ya está adjuntada al usuario"

echo "✅ Configuración IAM completada!"
echo ""
echo "📋 Resumen:"
echo "   - Política: $POLICY_ARN"
echo "   - Usuario: $CURRENT_USER"
echo ""
echo "🔗 Para ver las políticas adjuntadas:"
echo "   aws iam list-attached-user-policies --user-name $CURRENT_USER"

