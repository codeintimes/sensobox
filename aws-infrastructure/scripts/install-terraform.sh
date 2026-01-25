#!/bin/bash
set -e

echo "📦 Installing Terraform..."

# Descargar Terraform binary (no requiere sudo)
TERRAFORM_VERSION="1.6.6"
TERRAFORM_URL="https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip"
INSTALL_DIR="$HOME/.local/bin"

mkdir -p "$INSTALL_DIR"

# Descargar
echo "Downloading Terraform ${TERRAFORM_VERSION}..."
wget -q "$TERRAFORM_URL" -O /tmp/terraform.zip

# Extraer
echo "Extracting..."
unzip -q -o /tmp/terraform.zip -d /tmp

# Mover a directorio local
mv /tmp/terraform "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/terraform"

# Agregar al PATH si no está
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
  echo "" >> ~/.bashrc
  echo "# Terraform" >> ~/.bashrc
  echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> ~/.bashrc
  export PATH="$HOME/.local/bin:$PATH"
fi

# Verificar instalación
"$INSTALL_DIR/terraform" version

echo ""
echo "✅ Terraform installed successfully!"
echo "   Location: $INSTALL_DIR/terraform"
echo ""
echo "⚠️  If you're using zsh, add this to ~/.zshrc:"
echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
echo ""
echo "Or run: source ~/.bashrc"

rm -f /tmp/terraform.zip

