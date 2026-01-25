#!/bin/bash

# Script para configurar credenciales de AWS
# Este script crea el archivo .env con las credenciales de AWS

echo "🔐 Configurando credenciales de AWS..."

# Verificar si .env ya existe
if [ -f .env ]; then
    echo "⚠️  El archivo .env ya existe."
    read -p "¿Deseas sobrescribirlo? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Operación cancelada."
        exit 1
    fi
fi

# Crear archivo .env con las credenciales de AWS
cat > .env << 'ENVEOF'
# AWS Credentials
AWS_ACCESS_KEY_ID=TU_ACCESS_KEY_ID_AQUI
AWS_SECRET_ACCESS_KEY=TU_SECRET_ACCESS_KEY_AQUI
AWS_REGION=eu-north-1

# MongoDB Configuration (agrega tu conexión si es necesario)
# MONGODB_URL=tu_mongodb_connection_string_aqui

# JWT Secret (agrega tu secret si es necesario)
# JWT_SECRET=tu_jwt_secret_aqui

# Port
PORT=4000
ENVEOF

echo "✅ Archivo .env creado exitosamente!"
echo ""
echo "📋 Credenciales configuradas:"
echo "   - Access Key ID: TU_ACCESS_KEY_ID_AQUI"
echo "   - Region: eu-north-1"
echo ""
echo "🔒 El archivo .env está protegido por .gitignore y NO se subirá a Git."
echo ""
echo "🚀 Para verificar la configuración, ejecuta:"
echo "   export \$(cat .env | xargs) && aws sts get-caller-identity"


