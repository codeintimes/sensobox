# Guía de Deployment - Inspections Frontend y Backend

Esta guía te ayudará a desplegar los proyectos `inspections-front` e `inspections-back` en AWS de forma económica.

## Arquitectura

- **Frontend**: S3 Bucket + Website hosting (más económico que EC2 para archivos estáticos)
- **Backend**: EC2 t3.micro con Elastic IP fija
- **CI/CD**: GitHub Actions automático
- **Costo estimado**: ~$10-15/mes (EC2 t3.micro + S3 + datos)

## Prerrequisitos

1. Cuenta de AWS con credenciales configuradas
2. Terraform instalado (>= 1.0)
3. AWS CLI configurado
4. Acceso a los repositorios de GitHub: `codeintimes/inspections-front` y `codeintimes/inspections-back`

## Paso 1: Configurar Infraestructura con Terraform

### 1.1. Configurar variables

```bash
cd aws-infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars con tus valores
```

### 1.2. Inicializar y aplicar Terraform

```bash
terraform init
terraform plan
terraform apply
```

Esto creará:
- EC2 instance (t3.micro) para el backend
- Elastic IP para el backend
- S3 bucket para el frontend
- Security Groups
- IAM roles y políticas

### 1.3. Guardar outputs

Después de `terraform apply`, guarda los outputs:

```bash
terraform output -json > outputs.json
```

Necesitarás:
- `backend_elastic_ip`: IP fija del backend
- `backend_instance_id`: ID de la instancia EC2
- `frontend_bucket_name`: Nombre del bucket S3
- `frontend_website_url`: URL del frontend

## Paso 2: Configurar IAM para GitHub Actions

### 2.1. Ejecutar script de setup IAM

```bash
cd ../scripts
chmod +x setup-iam.sh
./setup-iam.sh
```

Este script creará:
- IAM user para GitHub Actions
- Políticas necesarias
- Access keys

**⚠️ IMPORTANTE**: Guarda las Access Keys que se muestran, las necesitarás para GitHub Secrets.

### 2.2. Generar clave SSH para EC2

```bash
chmod +x generate-ssh-key.sh
./generate-ssh-key.sh
```

Esto generará una clave SSH que usarás para el deployment.

### 2.3. Agregar clave pública al EC2

```bash
# Obtener la IP del EC2 desde terraform output
EC2_IP=$(terraform -chdir=../terraform output -raw backend_elastic_ip)

# Copiar clave pública
ssh-copy-id -i ~/.ssh/inspections-backend-deploy-key.pub ubuntu@$EC2_IP
```

## Paso 3: Configurar Secrets en GitHub

Ve a cada repositorio en GitHub y agrega los siguientes secrets:

### Para `codeintimes/inspections-front`:

1. Ve a Settings > Secrets and variables > Actions
2. Agrega:
   - `AWS_ACCESS_KEY_ID`: (del paso 2.1)
   - `AWS_SECRET_ACCESS_KEY`: (del paso 2.1)

### Para `codeintimes/inspections-back`:

1. Ve a Settings > Secrets and variables > Actions
2. Agrega:
   - `AWS_ACCESS_KEY_ID`: (del paso 2.1)
   - `AWS_SECRET_ACCESS_KEY`: (del paso 2.1)
   - `EC2_INSTANCE_ID`: (del terraform output)
   - `EC2_HOST`: (del terraform output, backend_elastic_ip)
   - `EC2_SSH_PRIVATE_KEY`: (contenido de `~/.ssh/inspections-backend-deploy-key`)

## Paso 4: Configurar Variables de Entorno del Backend

### 4.1. Crear archivo .env.production

Crea un archivo `.env.production` en `inspections-back/` con todas las variables necesarias:

```bash
cd ../../inspections-back
cat > .env.production <<EOF
MONGO_URI=mongodb://...
JWT_SECRET=tu-jwt-secret-super-seguro
TESSERACT_HOST=...
TESSERACT_PORT=1433
TESSERACT_USER=...
TESSERACT_PASS=...
TESSERACT_DB=...
AWS_S3_BUCKET_NAME=inspections-backend-assets-codeintimes
AWS_S3_REGION=eu-west-1
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=http://inspections-frontend-codeintimes.s3-website-eu-west-1.amazonaws.com,http://<tu-elastic-ip>
REDIS_URL=redis://... (opcional)
EOF
```

### 4.2. Subir a AWS Secrets Manager

```bash
cd ../aws-infrastructure/scripts
chmod +x setup-secrets.sh
./setup-secrets.sh
```

O manualmente:

```bash
aws secretsmanager create-secret \
  --name inspections-backend-env \
  --secret-string file://../../inspections-back/.env.production \
  --region eu-west-1
```

## Paso 5: Configurar EC2 para cargar secrets

Modifica el script de deployment en el EC2 para cargar las variables desde Secrets Manager:

```bash
# SSH al EC2
ssh -i ~/.ssh/inspections-backend-deploy-key ubuntu@<elastic-ip>

# Editar el script de deployment
sudo nano /home/ubuntu/deploy-backend.sh
```

Agrega antes de `pm2 start`:

```bash
# Cargar variables de entorno desde Secrets Manager
export $(aws secretsmanager get-secret-value \
  --secret-id inspections-backend-env \
  --region eu-west-1 \
  --query SecretString \
  --output text | jq -r 'to_entries[] | "\(.key)=\(.value)"')
```

## Paso 6: Primer Deployment

### 6.1. Frontend

El frontend se desplegará automáticamente cuando hagas push a `main` o `prod`. También puedes hacerlo manualmente:

1. Ve a Actions en GitHub
2. Selecciona "Deploy Frontend to AWS S3"
3. Click en "Run workflow"

### 6.2. Backend

El backend también se desplegará automáticamente. Para el primer deployment manual:

```bash
# SSH al EC2
ssh -i ~/.ssh/inspections-backend-deploy-key ubuntu@<elastic-ip>

# Ejecutar deployment manual
cd /var/www/inspections-backend
git clone https://github.com/codeintimes/inspections-back.git .
export PATH="$HOME/.bun/bin:$PATH"
bun install
bun run build:prod

# Cargar variables de entorno
export $(aws secretsmanager get-secret-value \
  --secret-id inspections-backend-env \
  --region eu-west-1 \
  --query SecretString \
  --output text | jq -r 'to_entries[] | "\(.key)=\(.value)"')

# Iniciar con PM2
pm2 start dist/main.js --name inspections-backend
pm2 save
pm2 startup
```

## Paso 7: Configurar Dominio (Opcional)

### Opción A: Usar Route 53

1. Crea un hosted zone en Route 53
2. Crea registros A apuntando a la Elastic IP
3. Configura el dominio en el EC2

### Opción B: Usar solo la Elastic IP

La Elastic IP es permanente y siempre apuntará a tu instancia. Puedes usar directamente:
- Backend: `http://<elastic-ip>`
- Frontend: `http://inspections-frontend-codeintimes.s3-website-eu-west-1.amazonaws.com`

## URLs Finales

Después del deployment, tendrás:

- **Frontend**: `http://inspections-frontend-codeintimes.s3-website-eu-west-1.amazonaws.com`
- **Backend API**: `http://<elastic-ip>/api`
- **Backend Health**: `http://<elastic-ip>/api/health`

## Actualizar Frontend para usar el Backend

Edita `inspections-front/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://<elastic-ip>/api',  // Cambiar por tu Elastic IP
  version: '0.0.1',
  bucketName: 'arrow-parts-prod',
  region: 'eu-west-1',
};
```

## Monitoreo y Logs

### Ver logs del backend

```bash
ssh -i ~/.ssh/inspections-backend-deploy-key ubuntu@<elastic-ip>
pm2 logs inspections-backend
```

### Ver estado de PM2

```bash
pm2 status
pm2 monit
```

## Costos Estimados

- **EC2 t3.micro**: ~$7-8/mes (siempre encendido)
- **Elastic IP**: Gratis (si está asociada a una instancia)
- **S3**: ~$0.023/GB/mes + requests
- **Data Transfer**: ~$0.09/GB (primeros 10TB)
- **Total estimado**: ~$10-15/mes

## Troubleshooting

### El backend no inicia

1. Verifica las variables de entorno:
```bash
pm2 env inspections-backend
```

2. Verifica los logs:
```bash
pm2 logs inspections-backend --lines 100
```

3. Verifica que MongoDB/Tesseract estén accesibles

### El frontend no carga

1. Verifica que el bucket S3 tenga permisos públicos
2. Verifica que el website hosting esté habilitado
3. Verifica CORS en el backend

### GitHub Actions falla

1. Verifica que los secrets estén correctamente configurados
2. Verifica los permisos del IAM user
3. Verifica que la clave SSH sea correcta

## Actualización Automática

Una vez configurado, cada push a `main` o `prod` desplegará automáticamente:

- **Frontend**: Se actualiza en S3 automáticamente
- **Backend**: Se actualiza en EC2 automáticamente

No necesitas hacer nada manualmente después del primer setup.

## Seguridad

- ✅ Las credenciales están en AWS Secrets Manager
- ✅ El IAM user tiene permisos mínimos necesarios
- ✅ El EC2 solo acepta conexiones SSH con clave
- ✅ Nginx actúa como reverse proxy
- ⚠️ Considera agregar SSL/TLS con Let's Encrypt para producción

## Siguiente Paso: SSL/TLS

Para agregar HTTPS gratis:

```bash
# En el EC2
sudo certbot --nginx -d tu-dominio.com
```

Esto configurará Let's Encrypt automáticamente.

