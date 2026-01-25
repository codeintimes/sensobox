# 🚀 Guía de Deployment en AWS - Sensobox

Esta guía te ayudará a desplegar Sensobox en AWS de forma económica y con CI/CD automático.

## 📋 Arquitectura

- **Backend**: EC2 (t2.micro - Free Tier elegible)
- **Frontend**: S3 + CloudFront
- **CI/CD**: GitHub Actions
- **IP Fija**: Elastic IP
- **Costo estimado**: ~$5-10/mes (o $0 si usas Free Tier)

## 🛠️ Requisitos Previos

1. Cuenta de AWS con credenciales configuradas
2. AWS CLI instalado y configurado
3. Repositorio en GitHub (codeintimes/sensobox)
4. Acceso SSH a tu máquina local

## 📦 Instalación y Configuración

### Paso 1: Clonar y preparar

```bash
cd /home/rafa/projects/old/sensobox
chmod +x aws-setup/*.sh
```

### Paso 2: Ejecutar setup completo

```bash
cd aws-setup
bash setup-complete.sh
```

Este script ejecutará:
1. ✅ Configuración IAM (roles y políticas)
2. ✅ Creación de instancia EC2 para backend
3. ✅ Configuración de S3 y CloudFront para frontend

### Paso 3: Configurar GitHub Secrets

Ve a: https://github.com/codeintimes/sensobox/settings/secrets/actions

Agrega los siguientes secrets:

#### Secrets Requeridos:

```
AWS_ACCESS_KEY_ID=TU_ACCESS_KEY_ID_AQUI
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_REGION=eu-north-1
EC2_HOST=<IP_ELASTIC_IP>
EC2_USER=ubuntu
EC2_SSH_KEY=<contenido_completo_del_archivo.pem>
CLOUDFRONT_DISTRIBUTION_ID=<distribution_id>
S3_BUCKET_FRONTEND=sensobox-frontend
REACT_APP_API_URL=http://<IP_ELASTIC_IP>
```

**Para obtener EC2_SSH_KEY:**
```bash
cat sensobox-key.pem
# Copia todo el contenido incluyendo -----BEGIN RSA PRIVATE KEY----- y -----END RSA PRIVATE KEY-----
```

### Paso 4: Configurar variables de entorno en EC2

```bash
# Conectarte a la instancia
ssh -i sensobox-key.pem ubuntu@<ELASTIC_IP>

# Editar variables de entorno
sudo nano /opt/sensobox-backend/.env
```

Agrega:
```bash
MONGODB_URL=tu_mongodb_connection_string
JWT_SECRET=tu_jwt_secret_seguro
NODE_ENV=production
PORT=4000
```

### Paso 5: Primer Deployment

El deployment se activa automáticamente cuando:
- Haces push a la rama `main`
- O incluyes `[deploy]` en el mensaje del commit
- O modificas archivos en `sensobox_back/` o `sensobox_front/`

```bash
git add .
git commit -m "[deploy] Initial deployment"
git push origin main
```

## 🔄 CI/CD Automático

### GitHub Actions Workflow

El workflow (`.github/workflows/deploy.yml`) se ejecuta automáticamente y:

1. **Backend**:
   - Construye el proyecto
   - Crea un paquete de deployment
   - Lo sube a EC2 vía SSH
   - Reinicia el servicio

2. **Frontend**:
   - Construye la aplicación React
   - Sincroniza con S3
   - Invalida cache de CloudFront

### Verificar Deployment

1. Ve a: https://github.com/codeintimes/sensobox/actions
2. Revisa el estado del workflow
3. Si hay errores, revisa los logs

## 🌐 URLs de Acceso

Después del deployment:

- **Backend**: `http://<ELASTIC_IP>:4000` o `http://<ELASTIC_IP>`
- **Frontend**: `https://<cloudfront-domain>.cloudfront.net`

### Obtener URLs

```bash
# Backend IP
cat aws-setup/ec2-info.txt | grep "Elastic IP"

# Frontend URL
cat aws-setup/s3-cloudfront-info.txt | grep "CloudFront Domain"
```

## 💰 Costos Estimados

### Free Tier (Primeros 12 meses):
- EC2 t2.micro: 750 horas/mes **GRATIS**
- S3: 5GB almacenamiento **GRATIS**
- CloudFront: 50GB transferencia **GRATIS**
- Elastic IP: **GRATIS** (si está asociada a instancia activa)

### Después del Free Tier:
- EC2 t2.micro: ~$8-10/mes
- S3: ~$0.023/GB/mes
- CloudFront: ~$0.085/GB (primeros 10TB)
- Elastic IP: **GRATIS** (si está asociada)

**Total estimado**: $5-15/mes dependiendo del tráfico

## 🔧 Comandos Útiles

### Conectarse a EC2
```bash
ssh -i sensobox-key.pem ubuntu@<ELASTIC_IP>
```

### Ver logs del backend
```bash
ssh -i sensobox-key.pem ubuntu@<ELASTIC_IP>
sudo journalctl -u sensobox-backend -f
```

### Reiniciar servicio backend
```bash
ssh -i sensobox-key.pem ubuntu@<ELASTIC_IP>
sudo systemctl restart sensobox-backend
```

### Actualizar frontend manualmente
```bash
cd sensobox_front
npm run build
aws s3 sync build/ s3://sensobox-frontend/ --delete
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
```

### Ver estado de la instancia
```bash
aws ec2 describe-instances --instance-ids <INSTANCE_ID>
```

## 🛡️ Seguridad

### Recomendaciones:

1. **Restringir SSH**: Modifica el security group para solo permitir tu IP
2. **HTTPS**: Configura un certificado SSL en CloudFront (usando ACM)
3. **Variables de entorno**: Nunca subas `.env` a Git
4. **Rotar credenciales**: Cambia las Access Keys periódicamente
5. **Firewall**: Considera usar AWS WAF para CloudFront

### Restringir SSH a tu IP:

```bash
# Obtener tu IP pública
MY_IP=$(curl -s https://api.ipify.org)

# Actualizar security group
aws ec2 authorize-security-group-ingress \
  --group-id <SG_ID> \
  --protocol tcp \
  --port 22 \
  --cidr ${MY_IP}/32 \
  --region eu-north-1

# Eliminar regla anterior (0.0.0.0/0)
aws ec2 revoke-security-group-ingress \
  --group-id <SG_ID> \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0 \
  --region eu-north-1
```

## 🔍 Troubleshooting

### El backend no inicia

```bash
# Conectarse y verificar
ssh -i sensobox-key.pem ubuntu@<ELASTIC_IP>
sudo systemctl status sensobox-backend
sudo journalctl -u sensobox-backend -n 50
```

### El frontend no se actualiza

1. Verifica que el build se completó en GitHub Actions
2. Verifica que S3 tiene los archivos: `aws s3 ls s3://sensobox-frontend/`
3. Invalida manualmente el cache de CloudFront

### Error de conexión SSH en GitHub Actions

1. Verifica que `EC2_SSH_KEY` está correctamente configurado (con saltos de línea)
2. Verifica que `EC2_HOST` es la IP correcta
3. Verifica que el security group permite SSH desde GitHub Actions IPs

### Error de permisos IAM

Ejecuta nuevamente:
```bash
cd aws-setup
bash iam-setup.sh
```

## 📚 Recursos Adicionales

- [Documentación AWS EC2](https://docs.aws.amazon.com/ec2/)
- [Documentación AWS S3](https://docs.aws.amazon.com/s3/)
- [Documentación CloudFront](https://docs.aws.amazon.com/cloudfront/)
- [GitHub Actions](https://docs.github.com/en/actions)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs de GitHub Actions
2. Revisa los logs del servicio en EC2
3. Verifica la configuración de IAM
4. Consulta la documentación de AWS

---

**Última actualización**: $(date +%Y-%m-%d)

