#!/bin/bash
set -e

# Script para actualizar el user-data del EC2 después de cambios

AWS_REGION=${AWS_REGION:-eu-west-1}
INSTANCE_ID=${1:-""}

if [ -z "$INSTANCE_ID" ]; then
  echo "Usage: $0 <instance-id>"
  echo "Or set INSTANCE_ID environment variable"
  exit 1
fi

echo "🔄 Updating EC2 user-data for instance: $INSTANCE_ID"

# Leer el user-data actualizado
USER_DATA_FILE="$(dirname $0)/../terraform/user-data-backend.sh"

if [ ! -f "$USER_DATA_FILE" ]; then
  echo "❌ Error: user-data-backend.sh not found at $USER_DATA_FILE"
  exit 1
fi

# Codificar el user-data en base64
USER_DATA_B64=$(base64 -w 0 < "$USER_DATA_FILE")

# Actualizar el user-data del EC2
aws ec2 modify-instance-attribute \
  --instance-id "$INSTANCE_ID" \
  --user-data "Value=$USER_DATA_B64" \
  --region "$AWS_REGION"

echo "✅ User-data updated successfully!"
echo ""
echo "⚠️  Note: The instance will need to be restarted for the new user-data to take effect."
echo "   However, user-data only runs on first boot. For changes to take effect,"
echo "   you may need to manually apply them or recreate the instance."

