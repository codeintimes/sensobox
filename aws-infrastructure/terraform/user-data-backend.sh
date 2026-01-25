#!/bin/bash
set -e

# Actualizar sistema
apt-get update
apt-get upgrade -y

# Instalar dependencias básicas
apt-get install -y \
    curl \
    wget \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    build-essential \
    software-properties-common

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Instalar Bun
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> /home/ubuntu/.bashrc

# Instalar PM2 globalmente
npm install -g pm2

# Instalar AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
apt-get install -y unzip
unzip awscliv2.zip
./aws/install

# Crear directorio para la aplicación
mkdir -p /var/www/inspections-backend
chown -R ubuntu:ubuntu /var/www/inspections-backend

# Configurar Nginx como reverse proxy
cat > /etc/nginx/sites-available/inspections-backend <<EOF
server {
    listen 80;
    server_name _;

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        access_log off;
    }

    # API endpoints
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # All other routes
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Habilitar el sitio
ln -sf /etc/nginx/sites-available/inspections-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

# Instalar jq para parsear JSON
apt-get install -y jq

# Crear script de deployment
cat > /home/ubuntu/deploy-backend.sh <<'DEPLOY_SCRIPT'
#!/bin/bash
set -e

cd /var/www/inspections-backend

# Pull latest code
git pull origin main || git clone https://github.com/codeintimes/inspections-back.git .

# Instalar dependencias
export PATH="$HOME/.bun/bin:$PATH"
bun install

# Build
bun run build:prod

# Cargar variables de entorno desde AWS Secrets Manager
if [ -n "$AWS_REGION" ]; then
  echo "Loading environment variables from AWS Secrets Manager..."
  SECRETS=$(aws secretsmanager get-secret-value \
    --secret-id inspections-backend-env \
    --region $${AWS_REGION:-eu-west-1} \
    --query SecretString \
    --output text 2>/dev/null || echo "{}")
  
  if [ "$SECRETS" != "{}" ] && [ -n "$SECRETS" ]; then
    # Exportar variables de entorno desde el JSON
    export $(echo $SECRETS | jq -r 'to_entries[] | "\(.key)=\(.value)"')
    echo "Environment variables loaded from Secrets Manager"
  else
    echo "⚠️  Warning: Could not load secrets from AWS Secrets Manager"
  fi
else
  echo "⚠️  Warning: AWS_REGION not set, skipping Secrets Manager"
fi

# Crear archivo .env para PM2
if [ -n "$MONGO_URI" ]; then
  cat > .env <<ENVFILE
MONGO_URI=$MONGO_URI
JWT_SECRET=$JWT_SECRET
TESSERACT_HOST=$TESSERACT_HOST
TESSERACT_PORT=$TESSERACT_PORT
TESSERACT_USER=$TESSERACT_USER
TESSERACT_PASS=$TESSERACT_PASS
TESSERACT_DB=$TESSERACT_DB
AWS_S3_BUCKET_NAME=$AWS_S3_BUCKET_NAME
AWS_S3_REGION=$${AWS_S3_REGION:-eu-west-1}
NODE_ENV=$${NODE_ENV:-production}
PORT=$${PORT:-3000}
ALLOWED_ORIGINS=$${ALLOWED_ORIGINS:-*}
REDIS_URL=$REDIS_URL
INTERNAL_API_KEY=$${INTERNAL_API_KEY:-brrbrrpatapim88}
ENVFILE
fi

# Reiniciar aplicación con PM2
pm2 delete inspections-backend 2>/dev/null || true
pm2 start dist/main.js --name inspections-backend --update-env --env production
pm2 save
pm2 startup
DEPLOY_SCRIPT

chmod +x /home/ubuntu/deploy-backend.sh
chown ubuntu:ubuntu /home/ubuntu/deploy-backend.sh

# Instalar MongoDB (opcional, puedes usar MongoDB Atlas en su lugar)
# wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
# echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
# apt-get update
# apt-get install -y mongodb-org
# systemctl start mongod
# systemctl enable mongod

# Configurar firewall básico (ufw)
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "Backend setup completed successfully!"

