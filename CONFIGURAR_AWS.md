# Configuración de Credenciales AWS

## ✅ Credenciales obtenidas

Tus credenciales de AWS han sido generadas exitosamente:

- **Access Key ID**: `TU_ACCESS_KEY_ID_AQUI`
- **Secret Access Key**: `TU_SECRET_ACCESS_KEY_AQUI`
- **Región**: `eu-north-1`

⚠️ **IMPORTANTE**: Reemplaza los valores de arriba con tus credenciales reales obtenidas de AWS IAM.

## 🔒 Configuración segura

### Opción 1: Archivo .env (Recomendado para desarrollo)

Crea un archivo `.env` en la raíz del proyecto (`/home/rafa/projects/old/sensobox/.env`) con el siguiente contenido:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=TU_ACCESS_KEY_ID_AQUI
AWS_SECRET_ACCESS_KEY=TU_SECRET_ACCESS_KEY_AQUI
AWS_REGION=eu-north-1

# MongoDB Configuration (si no está ya configurado)
# MONGODB_URL=tu_mongodb_connection_string_aqui

# JWT Secret (si no está ya configurado)
# JWT_SECRET=tu_jwt_secret_aqui

# Port
PORT=4000
```

### Opción 2: Archivo de credenciales de AWS CLI

Crea el archivo `~/.aws/credentials`:

```bash
mkdir -p ~/.aws
cat > ~/.aws/credentials << 'EOF'
[default]
aws_access_key_id = TU_ACCESS_KEY_ID_AQUI
aws_secret_access_key = TU_SECRET_ACCESS_KEY_AQUI
region = eu-north-1
EOF
```

Y también crea `~/.aws/config`:

```bash
cat > ~/.aws/config << 'EOF'
[default]
region = eu-north-1
output = json
EOF
```

## 🚀 Verificar configuración

Para verificar que las credenciales están configuradas correctamente, ejecuta:

```bash
aws sts get-caller-identity
```

O si usas el archivo .env, puedes probar con:

```bash
export AWS_ACCESS_KEY_ID=TU_ACCESS_KEY_ID_AQUI
export AWS_SECRET_ACCESS_KEY=TU_SECRET_ACCESS_KEY_AQUI
export AWS_REGION=eu-north-1
aws sts get-caller-identity
```

## ⚠️ Importante

1. **NUNCA** subas el archivo `.env` a Git (ya está en `.gitignore`)
2. **NUNCA** compartas estas credenciales públicamente
3. Si las credenciales se comprometen, elimínalas inmediatamente desde AWS IAM
4. Rota las credenciales periódicamente (cada 90 días es una buena práctica)

## 📝 Próximos pasos

Una vez configuradas las credenciales, Cursor podrá:
- Acceder a servicios de AWS (EC2, S3, etc.)
- Desplegar aplicaciones en AWS
- Gestionar recursos de AWS desde el IDE

## 🔗 Enlaces útiles

- [AWS IAM Console](https://console.aws.amazon.com/iam/home#/users)
- [Documentación AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)


