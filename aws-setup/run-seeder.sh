#!/bin/bash

# Script para ejecutar el seeder en EC2

set -e

echo "🌱 Ejecutando seeder en EC2..."

# Obtener información de EC2
if [ ! -f "ec2-info.txt" ]; then
    echo "❌ Archivo ec2-info.txt no encontrado. Ejecuta primero ec2-setup.sh"
    exit 1
fi

ELASTIC_IP=$(grep "Elastic IP:" ec2-info.txt | awk '{print $3}')
KEY_FILE="sensobox-key.pem"

if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Archivo $KEY_FILE no encontrado"
    exit 1
fi

echo "📡 Conectando a EC2: $ELASTIC_IP"
echo "⏳ Esto puede tardar unos minutos mientras se configura el servidor..."
echo ""

# Esperar a que el servidor esté listo
echo "🔍 Verificando que el servidor esté listo..."
for i in {1..30}; do
    if ssh -i $KEY_FILE -o StrictHostKeyChecking=no -o ConnectTimeout=5 ubuntu@$ELASTIC_IP "echo 'OK'" 2>/dev/null; then
        echo "✅ Servidor listo!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ No se pudo conectar al servidor después de 5 minutos"
        echo "💡 Espera unos minutos más y vuelve a intentar"
        exit 1
    fi
    echo "⏳ Esperando... ($i/30)"
    sleep 10
done

# Verificar que Node.js está instalado
echo "🔍 Verificando Node.js..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$ELASTIC_IP "node --version || echo 'Node.js no instalado'"

# Verificar MongoDB connection string
echo ""
echo "📝 Verificando configuración de MongoDB..."
echo "💡 Asegúrate de que MONGODB_URL esté configurado en /opt/sensobox-backend/.env"

# Ejecutar el seeder
echo ""
echo "🌱 Ejecutando seeder..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$ELASTIC_IP << 'ENDSSH'
cd /opt/sensobox-backend

# Verificar que existe el directorio
if [ ! -d "dist" ]; then
    echo "⚠️  El directorio dist no existe. El proyecto aún no se ha desplegado."
    echo "💡 Ejecuta el deployment desde GitHub Actions primero"
    exit 1
fi

# Verificar .env
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "💡 Crea el archivo .env con MONGODB_URL configurado"
    exit 1
fi

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Ejecutar el seeder
echo "🌱 Ejecutando generate-data.ts..."
npx ts-node generate-data.ts

echo "✅ Seeder ejecutado exitosamente!"
ENDSSH

echo ""
echo "🎉 Seeder completado!"
echo "🌐 Verifica los datos en: http://$ELASTIC_IP"

