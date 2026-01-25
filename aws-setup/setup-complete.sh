#!/bin/bash

# Script maestro para configurar todo el entorno AWS

set -e

echo "🚀 Iniciando configuración completa de AWS para Sensobox..."
echo ""

# Verificar que AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI no está instalado. Por favor instálalo primero:"
    echo "   curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "   unzip awscliv2.zip && sudo ./aws/install"
    exit 1
fi

# Verificar credenciales
echo "🔐 Verificando credenciales de AWS..."
if ! aws sts get-caller-identity &>/dev/null; then
    echo "❌ No se pueden verificar las credenciales de AWS."
    echo "   Configura tus credenciales con: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ Conectado a cuenta AWS: $ACCOUNT_ID"
echo ""

# Paso 1: Configurar IAM
echo "════════════════════════════════════════"
echo "PASO 1: Configuración IAM"
echo "════════════════════════════════════════"
bash iam-setup.sh
echo ""

# Paso 2: Crear EC2 para backend
echo "════════════════════════════════════════"
echo "PASO 2: Configuración EC2 (Backend)"
echo "════════════════════════════════════════"
read -p "¿Deseas crear la instancia EC2 ahora? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    bash ec2-setup.sh
    echo ""
    echo "⏳ Espera 2-3 minutos antes de continuar para que la instancia termine de configurarse..."
    sleep 5
else
    echo "⏭️  Saltando configuración de EC2. Puedes ejecutarla después con: bash ec2-setup.sh"
fi
echo ""

# Paso 3: Configurar S3 y CloudFront
echo "════════════════════════════════════════"
echo "PASO 3: Configuración S3 y CloudFront (Frontend)"
echo "════════════════════════════════════════"
read -p "¿Deseas configurar S3 y CloudFront ahora? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    bash s3-cloudfront-setup.sh
else
    echo "⏭️  Saltando configuración de S3/CloudFront. Puedes ejecutarla después con: bash s3-cloudfront-setup.sh"
fi
echo ""

# Resumen
echo "════════════════════════════════════════"
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "════════════════════════════════════════"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Configurar GitHub Secrets:"
echo "   Ve a: https://github.com/codeintimes/sensobox/settings/secrets/actions"
echo ""
echo "   Agrega los siguientes secrets:"
echo "   - AWS_ACCESS_KEY_ID (tu access key)"
echo "   - AWS_SECRET_ACCESS_KEY (tu secret key)"
if [ -f "ec2-info.txt" ]; then
    echo "   - EC2_HOST (IP de la instancia)"
    echo "   - EC2_USER=ubuntu"
    echo "   - EC2_SSH_KEY (contenido del archivo .pem)"
fi
if [ -f "s3-cloudfront-info.txt" ]; then
    echo "   - CLOUDFRONT_DISTRIBUTION_ID"
    echo "   - S3_BUCKET_FRONTEND=sensobox-frontend"
fi
echo "   - REACT_APP_API_URL (URL de tu backend)"
echo ""
echo "2. Configurar variables de entorno en EC2:"
echo "   ssh -i sensobox-key.pem ubuntu@<IP_EC2>"
echo "   sudo nano /opt/sensobox-backend/.env"
echo ""
echo "3. Hacer push a main para activar el deployment:"
echo "   git add ."
echo "   git commit -m '[deploy] Initial deployment'"
echo "   git push origin main"
echo ""
echo "📚 Documentación completa en: DEPLOYMENT.md"
echo ""
echo "🎉 ¡Todo listo para deployar!"

