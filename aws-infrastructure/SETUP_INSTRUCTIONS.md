# 🚀 Instrucciones de Setup - Paso a Paso

## Paso 1: Instalar Terraform

Ejecuta el script de instalación:

```bash
cd aws-infrastructure/scripts
./install-terraform.sh
```

Esto instalará Terraform en `~/.local/bin/terraform` sin necesidad de sudo.

**Nota**: Si usas zsh, agrega esto a tu `~/.zshrc`:
```bash
export PATH="$HOME/.local/bin:$PATH"
```

Luego ejecuta:
```bash
source ~/.zshrc
# o
source ~/.bashrc
```

Verifica la instalación:
```bash
terraform version
```

## Paso 2: Elegir Región de AWS

Si quieres usar una región diferente a `eu-west-1` (por ejemplo, `eu-north-1` que viste en la consola):

```bash
cd aws-infrastructure/scripts
./choose-region.sh
```

O manualmente edita `terraform/terraform.tfvars` y cambia:
```hcl
aws_region = "eu-north-1"  # o la región que prefieras
```

## Paso 3: Configurar Variables de Terraform

```bash
cd aws-infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edita `terraform.tfvars` con tus valores (opcional, los defaults funcionan):
```hcl
aws_region                = "eu-west-1"  # o tu región preferida
frontend_bucket_name      = "inspections-frontend-codeintimes"
backend_assets_bucket_name = "inspections-backend-assets-codeintimes"
```

## Paso 4: Ejecutar Setup Completo

```bash
cd aws-infrastructure/scripts
./quick-setup.sh
```

Este script:
1. ✅ Inicializa Terraform
2. ✅ Crea la infraestructura (EC2, S3, Elastic IP, etc.)
3. ✅ Configura IAM para GitHub Actions
4. ✅ Genera clave SSH
5. ✅ Te muestra qué secrets agregar a GitHub

## Paso 5: Configurar GitHub Secrets

Después del setup, agrega estos secrets en GitHub:

### Para `codeintimes/inspections-front`:
- Settings → Secrets and variables → Actions → New repository secret
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`

### Para `codeintimes/inspections-back`:
- Settings → Secrets and variables → Actions → New repository secret
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `EC2_INSTANCE_ID` (del output de Terraform)
  - `EC2_HOST` (Elastic IP del output de Terraform)
  - `EC2_SSH_PRIVATE_KEY` (contenido de `~/.ssh/inspections-backend-deploy-key`)

## Paso 6: Configurar Variables de Entorno del Backend

Crea un archivo `.env.production` en `inspections-back/`:

```bash
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
```

Luego súbelo a AWS Secrets Manager:

```bash
cd ../aws-infrastructure/scripts
./setup-secrets.sh
```

## Paso 7: Hacer Push y Deploy Automático

```bash
# En inspections-front
cd ../../inspections-front
git add .github/workflows/deploy.yml
git commit -m "Add CI/CD workflow"
git push origin main

# En inspections-back
cd ../inspections-back
git add .github/workflows/deploy.yml
git commit -m "Add CI/CD workflow"
git push origin main
```

Los workflows de GitHub Actions se ejecutarán automáticamente y desplegarán todo.

## Paso 8: Verificar Deployment

```bash
# Obtener la IP del backend
cd aws-infrastructure/terraform
BACKEND_IP=$(terraform output -raw backend_elastic_ip)

# Health check
cd ../scripts
./health-check.sh $BACKEND_IP
```

## 🆘 Troubleshooting

### Terraform no se encuentra
```bash
export PATH="$HOME/.local/bin:$PATH"
# O agrega a ~/.bashrc o ~/.zshrc
```

### Error de permisos en AWS
Verifica que tu usuario AWS tenga permisos para crear:
- EC2 instances
- S3 buckets
- IAM roles y policies
- Elastic IPs
- Security Groups

### Error al conectar por SSH
```bash
# Verificar que la clave SSH esté en el EC2
ssh -i ~/.ssh/inspections-backend-deploy-key ubuntu@<elastic-ip>
```

## 📋 Checklist Rápido

- [ ] Terraform instalado (`terraform version`)
- [ ] AWS CLI configurado (`aws sts get-caller-identity`)
- [ ] Región elegida (`./choose-region.sh`)
- [ ] Infraestructura creada (`./quick-setup.sh`)
- [ ] GitHub Secrets configurados
- [ ] Variables de entorno en Secrets Manager
- [ ] Push a main/prod realizado
- [ ] Health check exitoso

## 📚 Más Información

- **Guía Completa**: Ver `DEPLOYMENT_GUIDE.md`
- **Quick Start**: Ver `QUICK_START.md`
- **Resumen**: Ver `../DEPLOYMENT_SUMMARY.md`

