# Quick Start Guide

## Setup Rápido (5 minutos)

### 1. Prerrequisitos

```bash
# Instalar Terraform
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# Instalar AWS CLI (si no está instalado)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar credenciales AWS
aws configure
# Ingresa: Access Key ID, Secret Access Key, Region (eu-west-1), Output format (json)
```

### 2. Ejecutar Setup Automático

```bash
cd aws-infrastructure/scripts
chmod +x quick-setup.sh
./quick-setup.sh
```

Este script:
- ✅ Crea la infraestructura con Terraform
- ✅ Configura IAM para GitHub Actions
- ✅ Genera clave SSH
- ✅ Te guía para configurar GitHub Secrets

### 3. Configurar GitHub Secrets

Ve a cada repositorio en GitHub:

**codeintimes/inspections-front** → Settings → Secrets → Actions:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**codeintimes/inspections-back** → Settings → Secrets → Actions:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `EC2_INSTANCE_ID` (del output de Terraform)
- `EC2_HOST` (Elastic IP del output de Terraform)
- `EC2_SSH_PRIVATE_KEY` (contenido de `~/.ssh/inspections-backend-deploy-key`)

### 4. Configurar Variables de Entorno del Backend

```bash
# Crear archivo .env.production en inspections-back/
cd ../../inspections-back
cat > .env.production <<EOF
MONGO_URI=mongodb://tu-mongo-uri
JWT_SECRET=tu-jwt-secret-super-seguro
TESSERACT_HOST=tu-host
TESSERACT_PORT=1433
TESSERACT_USER=tu-user
TESSERACT_PASS=tu-pass
TESSERACT_DB=tu-db
AWS_S3_BUCKET_NAME=inspections-backend-assets-codeintimes
AWS_S3_REGION=eu-west-1
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=*
EOF

# Subir a AWS Secrets Manager
cd ../aws-infrastructure/scripts
./setup-secrets.sh
```

### 5. Hacer Push y Deploy Automático

```bash
# En inspections-front
git add .
git commit -m "Setup CI/CD"
git push origin main

# En inspections-back
git add .
git commit -m "Setup CI/CD"
git push origin main
```

Los workflows de GitHub Actions se ejecutarán automáticamente y desplegarán todo.

### 6. Verificar Deployment

```bash
# Obtener la IP del backend
BACKEND_IP=$(cd terraform && terraform output -raw backend_elastic_ip)

# Health check
cd ../scripts
./health-check.sh $BACKEND_IP
```

## URLs Finales

Después del deployment:

- **Frontend**: `http://inspections-frontend-codeintimes.s3-website-eu-west-1.amazonaws.com`
- **Backend**: `http://<tu-elastic-ip>`
- **Health Check**: `http://<tu-elastic-ip>/health`

## Troubleshooting Rápido

### El deployment falla en GitHub Actions

1. Verifica que todos los secrets estén configurados
2. Verifica que la clave SSH sea correcta
3. Verifica los permisos del IAM user

### El backend no inicia

```bash
# SSH al EC2
ssh -i ~/.ssh/inspections-backend-deploy-key ubuntu@<elastic-ip>

# Ver logs
pm2 logs inspections-backend

# Ver estado
pm2 status
```

### El frontend no carga

1. Verifica que el bucket S3 tenga permisos públicos
2. Verifica que el website hosting esté habilitado
3. Verifica CORS en el backend

## Costos

- **EC2 t3.micro**: ~$7-8/mes
- **S3**: ~$0.50-1/mes
- **Elastic IP**: Gratis
- **Total**: ~$10-15/mes

## Documentación Completa

Para más detalles, ver [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

