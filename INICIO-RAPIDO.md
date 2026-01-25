# ⚡ Inicio Rápido - Deployment AWS Sensobox

## ✅ Lo que se ha configurado

Se ha creado una infraestructura completa de deployment en AWS con:

1. **Backend en EC2** (t2.micro - Free Tier)
   - Instancia con Elastic IP (IP fija permanente)
   - Nginx como reverse proxy
   - Systemd service para auto-restart
   - Scripts de deployment automático

2. **Frontend en S3 + CloudFront**
   - Bucket S3 para hosting estático
   - CloudFront para CDN global
   - URL permanente con HTTPS

3. **CI/CD con GitHub Actions**
   - Deployment automático en cada push
   - Build y deploy de backend y frontend
   - Invalidación automática de cache

4. **IAM y Seguridad**
   - Políticas IAM configuradas
   - Security groups configurados
   - Scripts de setup automatizados

## 🚀 Próximos Pasos (15 minutos)

### Paso 1: Ejecutar Setup (5 min)

```bash
cd /home/rafa/projects/old/sensobox/aws-setup
bash setup-complete.sh
```

Esto creará:
- Instancia EC2 con Elastic IP
- Bucket S3 y CloudFront
- Archivos con información (ec2-info.txt, s3-cloudfront-info.txt)

### Paso 2: Configurar GitHub Secrets (5 min)

1. Ve a: https://github.com/codeintimes/sensobox/settings/secrets/actions
2. Click en "New repository secret"
3. Agrega cada uno de estos secrets:

```
AWS_ACCESS_KEY_ID = TU_ACCESS_KEY_ID_AQUI
AWS_SECRET_ACCESS_KEY = <tu_secret_key_del_archivo_.env>
EC2_HOST = <IP_del_archivo_ec2-info.txt>
EC2_USER = ubuntu
EC2_SSH_KEY = <contenido_completo_del_archivo_sensobox-key.pem>
CLOUDFRONT_DISTRIBUTION_ID = <del_archivo_s3-cloudfront-info.txt>
S3_BUCKET_FRONTEND = sensobox-frontend
REACT_APP_API_URL = http://<IP_del_EC2>
```

**Para obtener EC2_SSH_KEY:**
```bash
cat aws-setup/sensobox-key.pem
# Copia TODO el contenido incluyendo las líneas BEGIN y END
```

### Paso 3: Configurar Variables de Entorno en EC2 (3 min)

```bash
# Conectarse (usa la IP del archivo ec2-info.txt)
ssh -i aws-setup/sensobox-key.pem ubuntu@<ELASTIC_IP>

# Editar .env
sudo nano /opt/sensobox-backend/.env
```

Agrega estas líneas:
```bash
MONGODB_URL=tu_mongodb_connection_string
JWT_SECRET=tu_jwt_secret_muy_seguro
NODE_ENV=production
PORT=4000
```

Guarda (Ctrl+X, Y, Enter) y sal.

### Paso 4: Primer Deployment (2 min)

```bash
cd /home/rafa/projects/old/sensobox
git add .
git commit -m "[deploy] Initial deployment setup"
git push origin main
```

Ve a: https://github.com/codeintimes/sensobox/actions
Verás el workflow ejecutándose automáticamente.

## 🌐 URLs de Acceso

Después del deployment (10-15 minutos):

- **Backend API**: `http://<ELASTIC_IP>` 
  - Ver IP en: `aws-setup/ec2-info.txt`

- **Frontend Web**: `https://<cloudfront-domain>.cloudfront.net`
  - Ver URL en: `aws-setup/s3-cloudfront-info.txt`

## 📋 Archivos Importantes

- `DEPLOYMENT.md` - Documentación completa
- `README-DEPLOYMENT.md` - Guía rápida
- `aws-setup/ec2-info.txt` - Info de EC2 (se genera después del setup)
- `aws-setup/s3-cloudfront-info.txt` - Info de CloudFront (se genera después del setup)
- `aws-setup/sensobox-key.pem` - Key para SSH (¡GUÁRDALO SEGURO!)

## 💰 Costos

- **Free Tier (12 meses)**: $0/mes
- **Después**: ~$5-15/mes

## ⚠️ Importante

1. **NO subas** el archivo `sensobox-key.pem` a Git (ya está en .gitignore)
2. **NO subas** archivos `.env` a Git
3. Guarda el archivo `.pem` de forma segura (es la única forma de conectarte por SSH)

## 🆘 Si algo falla

1. Revisa los logs en GitHub Actions
2. Lee la sección "Troubleshooting" en `DEPLOYMENT.md`
3. Verifica que todos los secrets están correctamente configurados
4. Revisa los logs del servicio: `ssh ... && sudo journalctl -u sensobox-backend -f`

## 🎉 ¡Listo!

Una vez completados estos pasos, cada vez que hagas `git push` a main, se desplegará automáticamente.

---

**¿Preguntas?** Revisa `DEPLOYMENT.md` para documentación detallada.

