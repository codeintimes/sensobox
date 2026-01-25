#!/bin/bash

# Script de deployment para backend en EC2
# Este script se ejecuta en el servidor EC2

set -e

echo "🚀 Iniciando deployment del backend..."

# Variables
APP_DIR="/opt/sensobox-backend"
SERVICE_NAME="sensobox-backend"
BACKUP_DIR="/opt/backups"

# Crear directorios si no existen
mkdir -p $APP_DIR
mkdir -p $BACKUP_DIR

# Backup del deployment anterior
if [ -d "$APP_DIR/dist" ]; then
    echo "📦 Creando backup..."
    BACKUP_FILE="$BACKUP_DIR/backend-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf $BACKUP_FILE -C $APP_DIR dist/ node_modules/ package.json 2>/dev/null || true
    echo "✅ Backup creado: $BACKUP_FILE"
fi

# Extraer nuevo deployment
echo "📂 Extrayendo nuevo deployment..."
cd $APP_DIR
tar -xzf /tmp/backend-deploy.tar.gz

# Instalar dependencias de producción
echo "📥 Instalando dependencias..."
npm ci --production

# Cargar variables de entorno si existe .env
if [ -f "$APP_DIR/.env" ]; then
    echo "✅ Archivo .env encontrado"
else
    echo "⚠️  Archivo .env no encontrado. Usando .env.example como base..."
    if [ -f "$APP_DIR/.env.example" ]; then
        cp $APP_DIR/.env.example $APP_DIR/.env
        echo "⚠️  IMPORTANTE: Edita $APP_DIR/.env con tus credenciales reales"
    fi
fi

# Reiniciar servicio
echo "🔄 Reiniciando servicio..."
if systemctl is-active --quiet $SERVICE_NAME; then
    systemctl restart $SERVICE_NAME
    echo "✅ Servicio reiniciado"
else
    echo "⚠️  Servicio no está corriendo. Iniciando..."
    systemctl start $SERVICE_NAME || echo "⚠️  No se pudo iniciar el servicio. Verifica la configuración."
fi

# Verificar estado
sleep 2
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ Servicio activo y funcionando"
    systemctl status $SERVICE_NAME --no-pager -l
else
    echo "❌ El servicio no está activo. Revisa los logs:"
    journalctl -u $SERVICE_NAME -n 50 --no-pager
    exit 1
fi

echo "🎉 Deployment completado exitosamente!"

