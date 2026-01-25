#!/bin/bash
set -e

# Script para verificar el estado de los servicios

BACKEND_IP=${1:-""}
FRONTEND_BUCKET=${2:-"inspections-frontend-codeintimes"}
AWS_REGION=${AWS_REGION:-eu-west-1}

if [ -z "$BACKEND_IP" ]; then
  echo "Usage: $0 <backend-elastic-ip> [frontend-bucket-name]"
  exit 1
fi

echo "🏥 Health Check for Inspections Deployment"
echo "=========================================="
echo ""

# Check Backend
echo "🔍 Checking Backend (http://$BACKEND_IP)..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://$BACKEND_IP/health" || echo "000")

if [ "$BACKEND_STATUS" = "200" ]; then
  echo "✅ Backend is healthy (HTTP $BACKEND_STATUS)"
else
  echo "❌ Backend is not responding (HTTP $BACKEND_STATUS)"
fi

# Check Frontend
echo ""
echo "🔍 Checking Frontend (http://$FRONTEND_BUCKET.s3-website-$AWS_REGION.amazonaws.com)..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://$FRONTEND_BUCKET.s3-website-$AWS_REGION.amazonaws.com" || echo "000")

if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "✅ Frontend is accessible (HTTP $FRONTEND_STATUS)"
else
  echo "❌ Frontend is not accessible (HTTP $FRONTEND_STATUS)"
fi

# Check EC2 Instance
echo ""
echo "🔍 Checking EC2 Instance..."
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=ip-address,Values=$BACKEND_IP" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text \
  --region $AWS_REGION 2>/dev/null || echo "")

if [ -n "$INSTANCE_ID" ] && [ "$INSTANCE_ID" != "None" ]; then
  INSTANCE_STATE=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].State.Name' \
    --output text \
    --region $AWS_REGION)
  
  if [ "$INSTANCE_STATE" = "running" ]; then
    echo "✅ EC2 Instance is running (ID: $INSTANCE_ID)"
  else
    echo "⚠️  EC2 Instance state: $INSTANCE_STATE (ID: $INSTANCE_ID)"
  fi
else
  echo "❌ Could not find EC2 instance with IP $BACKEND_IP"
fi

echo ""
echo "=========================================="
echo "Health check completed!"

