# 🌐 URLs de Deployment - Inspections Frontend y Backend

## ✅ URLs Disponibles

### Frontend (Inspections Front)
**URL Principal:**
```
http://inspections-frontend-codeintimes.s3-website-eu-west-1.amazonaws.com
```

**Estado:** ✅ **FUNCIONANDO**
- Desplegado en S3
- Website hosting activado
- Accesible públicamente

### Backend (Inspections Back)
**URL Principal:**
```
http://54.216.195.211
```

**Endpoints:**
- Health Check: `http://54.216.195.211/health`
- API Base: `http://54.216.195.211/api`

**Estado:** ⚠️ **EN CONFIGURACIÓN**
- EC2 corriendo (IP: 54.216.195.211)
- Nginx instalado y funcionando
- Aplicación backend pendiente de deployment

## 📋 Información de Infraestructura

### EC2 Instance
- **Instance ID:** `i-06eacdbbf6b8cbf80`
- **Elastic IP:** `54.216.195.211`
- **Tipo:** t3.micro
- **Región:** eu-west-1
- **Estado:** Running

### S3 Bucket (Frontend)
- **Bucket Name:** `inspections-frontend-codeintimes`
- **Región:** eu-west-1
- **Website Hosting:** Habilitado

## 🔧 Próximos Pasos para Completar el Deployment

### 1. Desplegar Backend Manualmente

El backend necesita ser desplegado en el EC2. Opciones:

**Opción A: Usar GitHub Actions (Recomendado)**
- Configurar los secrets en GitHub
- Hacer push a `main` o `prod`
- El workflow desplegará automáticamente

**Opción B: Deployment Manual**
```bash
# SSH al EC2 (necesitarás configurar la clave SSH primero)
ssh ubuntu@54.216.195.211

# Clonar el repositorio
cd /var/www/inspections-backend
git clone https://github.com/codeintimes/inspections-back.git .

# Instalar dependencias
export PATH="$HOME/.bun/bin:$PATH"
bun install

# Build
bun run build:prod

# Configurar variables de entorno (desde AWS Secrets Manager)
export $(aws secretsmanager get-secret-value \
  --secret-id inspections-backend-env \
  --region eu-west-1 \
  --query SecretString \
  --output text | jq -r 'to_entries[] | "\(.key)=\(.value)"')

# Iniciar con PM2
pm2 start dist/main.js --name inspections-backend
pm2 save
```

### 2. Configurar Variables de Entorno

Asegúrate de tener configurado AWS Secrets Manager con:
- MONGO_URI
- JWT_SECRET
- TESSERACT_* (host, port, user, pass, db)
- AWS_S3_BUCKET_NAME
- Y otras variables necesarias

## 🔗 URLs Finales (Una vez completo)

- **Frontend:** http://inspections-frontend-codeintimes.s3-website-eu-west-1.amazonaws.com
- **Backend API:** http://54.216.195.211/api
- **Backend Health:** http://54.216.195.211/health

## 📝 Notas

- La Elastic IP `54.216.195.211` es **permanente** y no cambiará
- El frontend está completamente funcional
- El backend necesita el deployment inicial
- Una vez desplegado, el CI/CD de GitHub Actions mantendrá todo actualizado automáticamente

