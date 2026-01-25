# 🚀 Quick Start - Deployment AWS

## ⚡ Inicio Rápido (5 minutos)

### 1. Ejecutar setup completo

```bash
cd aws-setup
bash setup-complete.sh
```

Este script configurará automáticamente:
- ✅ IAM (roles y políticas)
- ✅ EC2 para backend (con Elastic IP)
- ✅ S3 + CloudFront para frontend

### 2. Configurar GitHub Secrets

Ve a: https://github.com/codeintimes/sensobox/settings/secrets/actions

Agrega estos secrets (los valores están en los archivos `.txt` generados):

```
AWS_ACCESS_KEY_ID=TU_ACCESS_KEY_ID_AQUI
AWS_SECRET_ACCESS_KEY=<tu_secret_key>
EC2_HOST=<IP_del_archivo_ec2-info.txt>
EC2_USER=ubuntu
EC2_SSH_KEY=<contenido_completo_del_archivo.pem>
CLOUDFRONT_DISTRIBUTION_ID=<del_archivo_s3-cloudfront-info.txt>
S3_BUCKET_FRONTEND=sensobox-frontend
REACT_APP_API_URL=http://<IP_del_EC2>
```

### 3. Configurar variables de entorno en EC2

```bash
# Conectarse (usa la IP del archivo ec2-info.txt)
ssh -i sensobox-key.pem ubuntu@<ELASTIC_IP>

# Editar .env
sudo nano /opt/sensobox-backend/.env
```

Agrega:
```
MONGODB_URL=tu_connection_string
JWT_SECRET=tu_secret_seguro
NODE_ENV=production
PORT=4000
```

### 4. Deployar

```bash
git add .
git commit -m "[deploy] Initial deployment"
git push origin main
```

¡Listo! El deployment se ejecutará automáticamente.

## 📍 URLs

Después del deployment (10-15 minutos):

- **Backend**: `http://<ELASTIC_IP>` (ver `aws-setup/ec2-info.txt`)
- **Frontend**: `https://<cloudfront-domain>` (ver `aws-setup/s3-cloudfront-info.txt`)

## 📚 Documentación Completa

Ver `DEPLOYMENT.md` para detalles completos, troubleshooting y más información.

## 💰 Costo

- **Free Tier**: $0/mes (primeros 12 meses)
- **Después**: ~$5-15/mes

## 🆘 Problemas?

1. Revisa los logs en GitHub Actions
2. Revisa `DEPLOYMENT.md` sección Troubleshooting
3. Verifica que todos los secrets están configurados

