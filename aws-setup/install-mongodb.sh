#!/bin/bash

# Script para instalar MongoDB en EC2

set -e

ELASTIC_IP="13.61.115.247"
KEY_FILE="sensobox-key.pem"

echo "🍃 Instalando MongoDB en EC2..."

ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$ELASTIC_IP << 'ENDSSH'
set -e

echo "📦 Actualizando sistema..."
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update

echo "🔑 Importando clave GPG de MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "📝 Agregando repositorio de MongoDB..."
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

echo "📥 Instalando MongoDB..."
sudo apt-get update
sudo apt-get install -y mongodb-org

echo "🔄 Iniciando MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod

echo "✅ Verificando estado de MongoDB..."
sudo systemctl status mongod --no-pager -l | head -20

echo "🔍 Verificando versión..."
mongod --version

echo "✅ MongoDB instalado y corriendo!"
echo ""
echo "📋 Información de conexión:"
echo "   - Host: localhost"
echo "   - Port: 27017"
echo "   - Database: sensobox"
echo "   - Connection String: mongodb://localhost:27017/sensobox"
ENDSSH

echo ""
echo "🎉 MongoDB instalado exitosamente!"
echo ""
echo "📝 Actualizando .env en el servidor..."

ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$ELASTIC_IP << 'ENDSSH'
cd /opt/sensobox-backend

# Actualizar .env con MongoDB local
if [ -f ".env" ]; then
    # Backup
    cp .env .env.backup
    
    # Actualizar MONGODB_URL
    sed -i 's|^MONGODB_URL=.*|MONGODB_URL=mongodb://localhost:27017/sensobox|' .env
    
    echo "✅ .env actualizado"
    echo "📋 MONGODB_URL configurado como: mongodb://localhost:27017/sensobox"
else
    echo "⚠️  Archivo .env no encontrado, creándolo..."
    cat > .env << EOF
MONGODB_URL=mongodb://localhost:27017/sensobox
JWT_SECRET=\$(openssl rand -base64 32)
NODE_ENV=production
PORT=4000
EOF
    echo "✅ .env creado"
fi
ENDSSH

echo ""
echo "✅ Configuración completada!"
echo ""
echo "🌱 Ahora puedes ejecutar el seeder con:"
echo "   bash aws-setup/run-seeder-local.sh"

