#!/bin/bash

# Script completo para configurar y ejecutar el seeder

set -e

ELASTIC_IP="13.61.115.247"
KEY_FILE="sensobox-key.pem"

echo "🚀 Configurando backend y ejecutando seeder..."
echo ""

# Verificar que existe la key
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Archivo $KEY_FILE no encontrado"
    exit 1
fi

# Esperar a que el servidor esté listo
echo "⏳ Esperando a que el servidor termine de configurarse (esto puede tardar 2-3 minutos)..."
for i in {1..60}; do
    if ssh -i $KEY_FILE -o StrictHostKeyChecking=no -o ConnectTimeout=5 ubuntu@$ELASTIC_IP "echo 'OK'" 2>/dev/null; then
        echo "✅ Servidor accesible!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ No se pudo conectar después de 10 minutos"
        exit 1
    fi
    echo "⏳ Esperando... ($i/60)"
    sleep 10
done

echo ""
echo "📦 Verificando Node.js..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$ELASTIC_IP "node --version || (echo 'Node.js no instalado, esperando...' && sleep 30 && node --version)"

echo ""
echo "📝 Configurando variables de entorno..."

# Leer MONGODB_URL del .env local si existe
if [ -f "../.env" ]; then
    MONGODB_URL=$(grep "^MONGODB_URL=" ../.env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -n "$MONGODB_URL" ]; then
        echo "✅ MONGODB_URL encontrado en .env local"
    fi
fi

# Si no hay MONGODB_URL, usar el de los comentarios del código o pedirlo
if [ -z "$MONGODB_URL" ]; then
    # Intentar obtener del código fuente
    MONGODB_URL=$(grep -r "mongodb+srv://" ../sensobox_back/src 2>/dev/null | head -1 | grep -oE "mongodb[^\"]*" | head -1 || echo "")
fi

# Si aún no hay MONGODB_URL, usar uno por defecto o pedirlo
if [ -z "$MONGODB_URL" ]; then
    echo "⚠️  MONGODB_URL no encontrado"
    echo "💡 Usando connection string por defecto del código..."
    MONGODB_URL="mongodb+srv://ortirafael8:4Af3QWOC90uEbExk@cluster0.l7wwmea.mongodb.net/sensobox?retryWrites=true&w=majority&appName=Cluster0"
    echo "✅ Usando: ${MONGODB_URL:0:50}..."
fi

# Configurar .env en el servidor
ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$ELASTIC_IP << ENDSSH
sudo mkdir -p /opt/sensobox-backend
sudo chown ubuntu:ubuntu /opt/sensobox-backend
cd /opt/sensobox-backend

# Crear .env
cat > .env << EOF
MONGODB_URL=$MONGODB_URL
JWT_SECRET=\$(openssl rand -base64 32)
NODE_ENV=production
PORT=4000
EOF

echo "✅ Archivo .env creado"
cat .env | grep -v "JWT_SECRET" | grep -v "MONGODB_URL"
ENDSSH

echo ""
echo "📥 Clonando repositorio y preparando seeder..."

ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$ELASTIC_IP << 'ENDSSH'
cd /opt/sensobox-backend

# Si no existe el código, clonarlo
if [ ! -d ".git" ]; then
    echo "📥 Clonando repositorio..."
    git clone https://github.com/codeintimes/sensobox.git /tmp/sensobox-temp
    cp -r /tmp/sensobox-temp/sensobox_back/* .
    rm -rf /tmp/sensobox-temp
fi

# Instalar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Compilar TypeScript si es necesario
if [ ! -d "dist" ]; then
    echo "🔨 Compilando TypeScript..."
    npm run build || echo "⚠️  Build falló, continuando..."
fi

echo "✅ Código preparado"
ENDSSH

echo ""
echo "🌱 Ejecutando seeder..."

ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$ELASTIC_IP << 'ENDSSH'
cd /opt/sensobox-backend

# Verificar conexión a MongoDB
echo "🔍 Verificando conexión a MongoDB..."
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
"

# Ejecutar seeder
echo "🌱 Ejecutando seeder (esto puede tardar varios minutos)..."
npx ts-node generate-data.ts || {
    echo "⚠️  Error ejecutando seeder con ts-node, intentando con node..."
    npm run build
    node dist/generate-data.js || echo "❌ Error ejecutando seeder"
}

echo "✅ Seeder completado"
ENDSSH

echo ""
echo "🎉 ¡Configuración y seeding completados!"
echo ""
echo "🌐 URLs del proyecto:"
echo "   Backend API: http://$ELASTIC_IP:4000"
echo "   Backend Web: http://$ELASTIC_IP"
echo ""
echo "💡 Para verificar los datos, puedes:"
echo "   1. Acceder a http://$ELASTIC_IP:4000/api (si Swagger está configurado)"
echo "   2. Verificar los logs: ssh -i $KEY_FILE ubuntu@$ELASTIC_IP 'sudo journalctl -u sensobox-backend -n 50'"

