# 🚀 Resumen de Deployment - Inspections Frontend y Backend

## ✅ Lo que se ha configurado

### 1. Infraestructura AWS (Terraform)
- ✅ EC2 t3.micro para el backend con Elastic IP fija
- ✅ S3 bucket para el frontend con website hosting
- ✅ Security Groups configurados
- ✅ IAM roles y políticas
- ✅ Scripts de inicialización del EC2

### 2. CI/CD con GitHub Actions
- ✅ Workflow para frontend (deploy a S3)
- ✅ Workflow para backend (deploy a EC2)
- ✅ Deploy automático en push a `main` o `prod`

### 3. Scripts de Utilidad
- ✅ `setup-iam.sh` - Configurar IAM para GitHub Actions
- ✅ `setup-secrets.sh` - Configurar AWS Secrets Manager
- ✅ `generate-ssh-key.sh` - Generar clave SSH
- ✅ `quick-setup.sh` - Setup automático completo
- ✅ `health-check.sh` - Verificar estado de los servicios

### 4. Documentación
- ✅ `DEPLOYMENT_GUIDE.md` - Guía completa paso a paso
- ✅ `QUICK_START.md` - Guía rápida de inicio
- ✅ `README.md` - Resumen de la infraestructura

## 📋 Próximos Pasos

### Paso 1: Configurar AWS Credentials

Si aún no tienes las credenciales configuradas:

```bash
aws configure
# Ingresa:
# - AWS Access Key ID: (del usuario rafa)
# - AWS Secret Access Key: (del usuario rafa)
# - Default region: eu-west-1
# - Default output format: json
```

### Paso 2: Ejecutar Setup

```bash
cd aws-infrastructure/scripts
chmod +x *.sh
./quick-setup.sh
```

Este script te guiará a través de:
1. Crear la infraestructura con Terraform
2. Configurar IAM
3. Generar claves SSH
4. Configurar secrets

### Paso 3: Configurar GitHub Secrets

Después del setup, agrega estos secrets a tus repositorios:

**Para `codeintimes/inspections-front`:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**Para `codeintimes/inspections-back`:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `EC2_INSTANCE_ID` (del output de Terraform)
- `EC2_HOST` (Elastic IP del output de Terraform)
- `EC2_SSH_PRIVATE_KEY` (contenido de `~/.ssh/inspections-backend-deploy-key`)

### Paso 4: Configurar Variables de Entorno

Crea un archivo `.env.production` en `inspections-back/` con todas las variables necesarias y súbelo a AWS Secrets Manager:

```bash
cd inspections-back
# Crear .env.production con tus variables
cd ../aws-infrastructure/scripts
./setup-secrets.sh
```

### Paso 5: Hacer Push y Deploy

```bash
# En ambos repositorios
git add .
git commit -m "Setup AWS deployment"
git push origin main
```

Los workflows de GitHub Actions se ejecutarán automáticamente.

## 🌐 URLs Finales

Después del deployment:

- **Frontend**: `http://inspections-frontend-codeintimes.s3-website-eu-west-1.amazonaws.com`
- **Backend**: `http://<tu-elastic-ip>`
- **Health Check**: `http://<tu-elastic-ip>/health`

## 💰 Costos Estimados

- **EC2 t3.micro**: ~$7-8/mes
- **S3 Storage**: ~$0.50-1/mes
- **Elastic IP**: Gratis (si está asociada)
- **Data Transfer**: ~$0.09/GB
- **Total**: ~$10-15/mes

## 📁 Estructura de Archivos Creados

```
aws-infrastructure/
├── terraform/
│   ├── main.tf                    # Recursos principales
│   ├── variables.tf               # Variables
│   ├── outputs.tf                 # Outputs
│   ├── user-data-backend.sh       # Script de inicialización EC2
│   └── terraform.tfvars.example   # Ejemplo de variables
├── scripts/
│   ├── setup-iam.sh               # Configurar IAM
│   ├── setup-secrets.sh           # Configurar Secrets Manager
│   ├── generate-ssh-key.sh        # Generar clave SSH
│   ├── quick-setup.sh             # Setup automático
│   ├── health-check.sh            # Health check
│   └── update-ec2-user-data.sh    # Actualizar user-data
├── DEPLOYMENT_GUIDE.md            # Guía completa
├── QUICK_START.md                 # Guía rápida
└── README.md                      # Resumen

inspections-front/.github/workflows/
└── deploy.yml                     # Workflow CI/CD frontend

inspections-back/.github/workflows/
└── deploy.yml                     # Workflow CI/CD backend
```

## 🔧 Comandos Útiles

### Ver estado de la infraestructura
```bash
cd aws-infrastructure/terraform
terraform show
terraform output
```

### Health check
```bash
cd aws-infrastructure/scripts
BACKEND_IP=$(cd ../terraform && terraform output -raw backend_elastic_ip)
./health-check.sh $BACKEND_IP
```

### Ver logs del backend
```bash
ssh -i ~/.ssh/inspections-backend-deploy-key ubuntu@<elastic-ip>
pm2 logs inspections-backend
```

### Reiniciar backend manualmente
```bash
ssh -i ~/.ssh/inspections-backend-deploy-key ubuntu@<elastic-ip>
cd /var/www/inspections-backend
/home/ubuntu/deploy-backend.sh
```

## ⚠️ Importante

1. **Credenciales AWS**: Las credenciales del usuario `rafa` deben tener permisos para crear recursos en AWS
2. **GitHub Secrets**: Todos los secrets deben estar configurados antes del primer deployment
3. **Variables de Entorno**: El backend necesita MongoDB, Tesseract y otras configuraciones
4. **Dominio**: Por ahora se usa la Elastic IP directamente. Para un dominio, ver la sección de Route 53 en DEPLOYMENT_GUIDE.md

## 📚 Documentación Adicional

- **Guía Completa**: Ver `aws-infrastructure/DEPLOYMENT_GUIDE.md`
- **Quick Start**: Ver `aws-infrastructure/QUICK_START.md`
- **Infraestructura**: Ver `aws-infrastructure/README.md`

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs de GitHub Actions
2. Verifica los secrets de GitHub
3. Revisa los logs del EC2 con `pm2 logs`
4. Ejecuta el health check
5. Revisa la documentación completa

¡Todo está listo para desplegar! 🎉

