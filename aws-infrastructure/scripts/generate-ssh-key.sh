#!/bin/bash
set -e

# Script para generar clave SSH para acceso al EC2

KEY_NAME="inspections-backend-deploy-key"
KEY_FILE="$HOME/.ssh/${KEY_NAME}"

echo "🔑 Generating SSH key for EC2 deployment..."

if [ -f "$KEY_FILE" ]; then
  echo "⚠️  Key already exists at $KEY_FILE"
  read -p "Do you want to overwrite it? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Using existing key."
    exit 0
  fi
fi

# Generar clave SSH
ssh-keygen -t rsa -b 4096 -f "$KEY_FILE" -N "" -C "inspections-backend-deploy"

echo ""
echo "✅ SSH key generated: $KEY_FILE"
echo ""
echo "📋 Next steps:"
echo "1. Add the public key to your EC2 instance:"
echo "   ssh-copy-id -i $KEY_FILE.pub ubuntu@<ec2-ip>"
echo ""
echo "2. Or manually add to ~/.ssh/authorized_keys on the EC2 instance:"
echo ""
cat "$KEY_FILE.pub"
echo ""
echo "3. Add the private key to GitHub Secrets as EC2_SSH_PRIVATE_KEY:"
echo ""
cat "$KEY_FILE"
echo ""

