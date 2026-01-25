#!/bin/bash

# Script para obtener las URLs del proyecto desplegado

echo "🔍 Buscando URLs del proyecto Sensobox..."
echo ""

REGION="eu-north-1"

# Buscar instancia EC2 del backend
echo "🖥️  Backend (EC2):"
INSTANCE_INFO=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=sensobox-backend" "Name=instance-state-name,Values=running" \
  --query 'Reservations[*].Instances[*].[PublicIpAddress,InstanceId]' \
  --output text \
  --region $REGION 2>/dev/null)

if [ -n "$INSTANCE_INFO" ]; then
    ELASTIC_IP=$(echo $INSTANCE_INFO | awk '{print $1}')
    INSTANCE_ID=$(echo $INSTANCE_INFO | awk '{print $2}')
    echo "   ✅ Instancia encontrada: $INSTANCE_ID"
    echo "   🌐 URL Backend: http://$ELASTIC_IP"
    echo "   🌐 URL Backend (Nginx): http://$ELASTIC_IP"
    echo "   📡 API: http://$ELASTIC_IP:4000"
else
    echo "   ❌ No se encontró instancia EC2 corriendo"
    echo "   💡 Ejecuta: bash aws-setup/ec2-setup.sh"
fi

echo ""

# Buscar bucket S3
echo "☁️  Frontend (S3):"
BUCKET_EXISTS=$(aws s3 ls s3://sensobox-frontend 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   ✅ Bucket encontrado: sensobox-frontend"
    echo "   🌐 URL S3: http://sensobox-frontend.s3-website-$REGION.amazonaws.com"
else
    echo "   ❌ Bucket no encontrado"
    echo "   💡 Ejecuta: bash aws-setup/s3-cloudfront-setup.sh"
fi

echo ""

# Buscar CloudFront
echo "🌐 Frontend (CloudFront):"
DISTRIBUTION=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='Sensobox Frontend Distribution'].[Id,DomainName,Status]" \
  --output text \
  --region $REGION 2>/dev/null)

if [ -n "$DISTRIBUTION" ]; then
    DIST_ID=$(echo $DISTRIBUTION | awk '{print $1}')
    DOMAIN=$(echo $DISTRIBUTION | awk '{print $2}')
    STATUS=$(echo $DISTRIBUTION | awk '{print $3}')
    echo "   ✅ Distribución encontrada: $DIST_ID"
    echo "   🌐 URL Frontend: https://$DOMAIN"
    echo "   📊 Estado: $STATUS"
    if [ "$STATUS" != "Deployed" ]; then
        echo "   ⏳ Nota: La distribución puede tardar 10-15 minutos en estar completamente activa"
    fi
else
    echo "   ❌ Distribución CloudFront no encontrada"
    echo "   💡 Ejecuta: bash aws-setup/s3-cloudfront-setup.sh"
fi

echo ""
echo "════════════════════════════════════════"
echo "📋 Resumen de URLs:"
echo "════════════════════════════════════════"

if [ -n "$INSTANCE_INFO" ]; then
    echo "Backend API:  http://$ELASTIC_IP:4000"
    echo "Backend Web:  http://$ELASTIC_IP"
fi

if [ -n "$DISTRIBUTION" ]; then
    DOMAIN=$(echo $DISTRIBUTION | awk '{print $2}')
    echo "Frontend:     https://$DOMAIN"
fi

if [ -z "$INSTANCE_INFO" ] && [ -z "$DISTRIBUTION" ]; then
    echo ""
    echo "⚠️  No se encontraron recursos desplegados."
    echo ""
    echo "Para crear la infraestructura, ejecuta:"
    echo "   cd aws-setup"
    echo "   bash setup-complete.sh"
fi

