#!/bin/bash

# Script para ejecutar el seeder con MongoDB local

set -e

ELASTIC_IP="13.61.115.247"
KEY_FILE="sensobox-key.pem"

echo "🌱 Ejecutando seeder con MongoDB local..."

ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$ELASTIC_IP << 'ENDSSH'
set -e

cd /opt/sensobox-backend

# Verificar que MongoDB está corriendo
echo "🔍 Verificando MongoDB..."
if ! sudo systemctl is-active --quiet mongod; then
    echo "⚠️  MongoDB no está corriendo, iniciándolo..."
    sudo systemctl start mongod
    sleep 2
fi

# Verificar conexión
echo "🔗 Verificando conexión a MongoDB..."
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sensobox')
  .then(() => {
    console.log('✅ Conectado a MongoDB local');
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
"

# Asegurar que generate-data.ts existe
if [ ! -f "generate-data.ts" ]; then
    echo "📋 Copiando generate-data.ts..."
    git clone https://github.com/codeintimes/sensobox.git /tmp/sensobox-temp 2>/dev/null || true
    if [ -f "/tmp/sensobox-temp/sensobox_back/generate-data.ts" ]; then
        cp /tmp/sensobox-temp/sensobox_back/generate-data.ts .
        echo "✅ generate-data.ts copiado"
    else
        echo "❌ No se pudo copiar generate-data.ts"
        exit 1
    fi
    rm -rf /tmp/sensobox-temp
fi

# Instalar ts-node si no está instalado
if ! command -v ts-node &> /dev/null; then
    echo "📦 Instalando ts-node..."
    npm install -g ts-node typescript
fi

# Ejecutar el seeder
echo ""
echo "🌱 Ejecutando seeder (esto puede tardar varios minutos)..."
echo "   Generando usuarios y órdenes..."
echo ""

export NODE_OPTIONS="--max-old-space-size=4096"
npx ts-node generate-data.ts

echo ""
echo "✅ Seeder completado exitosamente!"
echo ""
echo "📊 Verificando datos generados..."

node -e "
const mongoose = require('mongoose');
const { UserModel } = require('./dist/src/auth/domain/schemas/user.schema');
const { OrderModel } = require('./dist/src/order/domain/schemas/order.schema');

mongoose.connect('mongodb://localhost:27017/sensobox')
  .then(async () => {
    const userCount = await UserModel.countDocuments();
    const orderCount = await OrderModel.countDocuments();
    console.log(\`✅ Usuarios en la base de datos: \${userCount}\`);
    console.log(\`✅ Órdenes en la base de datos: \${orderCount}\`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
"
ENDSSH

echo ""
echo "🎉 ¡Seeder ejecutado exitosamente!"
echo ""
echo "🌐 URLs del proyecto:"
echo "   Backend API: http://$ELASTIC_IP:4000"
echo "   Backend Web: http://$ELASTIC_IP"
echo ""
echo "💡 El backend debería estar funcionando con datos ahora!"

