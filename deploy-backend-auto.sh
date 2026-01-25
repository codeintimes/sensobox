#!/bin/bash
# Script de despliegue automático del backend
# Este script se ejecuta en el servidor EC2

set -e

APP_DIR="/opt/sensobox-backend"
SERVICE_NAME="sensobox-backend"

echo "🚀 Iniciando despliegue automático del backend..."

cd $APP_DIR

# Actualizar código desde GitHub
echo "📥 Actualizando código desde GitHub..."
git fetch origin main
git reset --hard origin/main

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Reiniciar servicio
echo "🔄 Reiniciando servicio..."
sudo systemctl restart $SERVICE_NAME

# Esperar a que el servicio inicie
sleep 5

# Verificar estado
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ Servicio activo y funcionando"
    echo ""
    echo "🌱 Ahora puedes ejecutar el seeder usando el endpoint:"
    echo "   POST http://13.61.115.247:4000/admin/seed"
else
    echo "❌ El servicio no está activo. Revisa los logs:"
    sudo journalctl -u $SERVICE_NAME -n 50 --no-pager
    exit 1
fi

echo ""
echo "🎉 Despliegue completado exitosamente!"

