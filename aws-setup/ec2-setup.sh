#!/bin/bash

# Script para crear y configurar instancia EC2 para el backend

set -e

echo "🖥️  Configurando EC2 para backend de Sensobox..."

# Variables configurables
INSTANCE_TYPE="t3.micro"  # t3.micro es más compatible en eu-north-1
KEY_NAME="sensobox-key"
SECURITY_GROUP_NAME="sensobox-backend-sg"
AMI_ID=""  # Se detectará automáticamente según la región
REGION="eu-north-1"

# Detectar AMI más reciente de Ubuntu 22.04 LTS
echo "🔍 Detectando AMI más reciente de Ubuntu 22.04 LTS..."
AMI_ID=$(aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text \
  --region $REGION)

echo "✅ AMI seleccionada: $AMI_ID"

# Crear key pair si no existe
echo "🔑 Verificando key pair..."
if ! aws ec2 describe-key-pairs --key-names $KEY_NAME --region $REGION &>/dev/null; then
    echo "📝 Creando nuevo key pair..."
    aws ec2 create-key-pair \
      --key-name $KEY_NAME \
      --region $REGION \
      --query 'KeyMaterial' \
      --output text > ${KEY_NAME}.pem
    
    chmod 400 ${KEY_NAME}.pem
    echo "✅ Key pair creado: ${KEY_NAME}.pem"
    echo "⚠️  IMPORTANTE: Guarda este archivo de forma segura. Es la única vez que podrás descargarlo."
else
    echo "✅ Key pair ya existe"
fi

# Crear security group
echo "🛡️  Configurando security group..."
if ! aws ec2 describe-security-groups --group-names $SECURITY_GROUP_NAME --region $REGION &>/dev/null; then
    echo "📝 Creando security group..."
    SG_ID=$(aws ec2 create-security-group \
      --group-name $SECURITY_GROUP_NAME \
      --description "Security group para Sensobox backend" \
      --region $REGION \
      --query 'GroupId' \
      --output text)
    
    # Permitir SSH
    aws ec2 authorize-security-group-ingress \
      --group-id $SG_ID \
      --protocol tcp \
      --port 22 \
      --cidr 0.0.0.0/0 \
      --region $REGION
    
    # Permitir HTTP
    aws ec2 authorize-security-group-ingress \
      --group-id $SG_ID \
      --protocol tcp \
      --port 80 \
      --cidr 0.0.0.0/0 \
      --region $REGION
    
    # Permitir HTTPS
    aws ec2 authorize-security-group-ingress \
      --group-id $SG_ID \
      --protocol tcp \
      --port 443 \
      --cidr 0.0.0.0/0 \
      --region $REGION
    
    # Permitir puerto de la aplicación (4000)
    aws ec2 authorize-security-group-ingress \
      --group-id $SG_ID \
      --protocol tcp \
      --port 4000 \
      --cidr 0.0.0.0/0 \
      --region $REGION
    
    echo "✅ Security group creado: $SG_ID"
else
    SG_ID=$(aws ec2 describe-security-groups --group-names $SECURITY_GROUP_NAME --region $REGION --query 'SecurityGroups[0].GroupId' --output text)
    echo "✅ Security group ya existe: $SG_ID"
fi

# Script de user data para configurar el servidor
cat > /tmp/user-data.sh << 'USERDATA'
#!/bin/bash
set -e

# Actualizar sistema
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Instalar PM2 globalmente
npm install -g pm2

# Instalar Nginx
apt-get install -y nginx

# Configurar Nginx como reverse proxy
cat > /etc/nginx/sites-available/sensobox-backend << 'NGINX'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/sensobox-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx
systemctl enable nginx

# Crear directorio de la aplicación
mkdir -p /opt/sensobox-backend
chown ubuntu:ubuntu /opt/sensobox-backend

# Crear servicio systemd
cat > /etc/systemd/system/sensobox-backend.service << 'SERVICE'
[Unit]
Description=Sensobox Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/sensobox-backend
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/sensobox-backend/.env

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable sensobox-backend

# Instalar CloudWatch agent (opcional)
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E amazon-cloudwatch-agent.deb || true

echo "✅ Configuración del servidor completada"
USERDATA

# Crear instancia EC2
echo "🚀 Creando instancia EC2..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_NAME \
  --security-group-ids $SG_ID \
  --user-data file:///tmp/user-data.sh \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=sensobox-backend}]" \
  --region $REGION \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "✅ Instancia creada: $INSTANCE_ID"
echo "⏳ Esperando a que la instancia esté en estado 'running'..."

aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Obtener IP pública
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --region $REGION \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "✅ IP Pública: $PUBLIC_IP"

# Asignar Elastic IP
echo "🔗 Asignando Elastic IP..."
ALLOCATION_ID=$(aws ec2 allocate-address \
  --domain vpc \
  --region $REGION \
  --query 'AllocationId' \
  --output text)

aws ec2 associate-address \
  --instance-id $INSTANCE_ID \
  --allocation-id $ALLOCATION_ID \
  --region $REGION

ELASTIC_IP=$(aws ec2 describe-addresses \
  --allocation-ids $ALLOCATION_ID \
  --region $REGION \
  --query 'Addresses[0].PublicIp' \
  --output text)

echo "✅ Elastic IP asignada: $ELASTIC_IP"

# Guardar información
cat > ec2-info.txt << EOF
Instancia EC2 creada exitosamente
================================
Instance ID: $INSTANCE_ID
Elastic IP: $ELASTIC_IP
Key Pair: $KEY_NAME.pem
Security Group: $SG_ID
Region: $REGION

Para conectarte:
ssh -i ${KEY_NAME}.pem ubuntu@$ELASTIC_IP

URL del backend:
http://$ELASTIC_IP:4000
http://$ELASTIC_IP (a través de Nginx)

Próximos pasos:
1. Espera 2-3 minutos para que termine la configuración inicial
2. Conéctate por SSH y verifica: sudo systemctl status sensobox-backend
3. Configura las variables de entorno en /opt/sensobox-backend/.env
4. Agrega estos valores a los secrets de GitHub:
   - EC2_HOST=$ELASTIC_IP
   - EC2_USER=ubuntu
   - EC2_SSH_KEY (contenido del archivo ${KEY_NAME}.pem)
EOF

echo ""
echo "📋 Información guardada en: ec2-info.txt"
echo ""
echo "🎉 Configuración de EC2 completada!"
echo "🌐 Backend disponible en: http://$ELASTIC_IP"

