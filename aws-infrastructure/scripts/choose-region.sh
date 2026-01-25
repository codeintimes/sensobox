#!/bin/bash

# Script para elegir la región de AWS

echo "🌍 Selecciona la región de AWS para el deployment:"
echo ""
echo "1) eu-west-1 (Europa - Irlanda) - Recomendado"
echo "2) eu-north-1 (Europa - Estocolmo)"
echo "3) eu-central-1 (Europa - Frankfurt)"
echo "4) us-east-1 (EE.UU. - N. Virginia)"
echo "5) Otra (especificar)"
echo ""

read -p "Elige una opción (1-5): " choice

case $choice in
  1)
    REGION="eu-west-1"
    ;;
  2)
    REGION="eu-north-1"
    ;;
  3)
    REGION="eu-central-1"
    ;;
  4)
    REGION="us-east-1"
    ;;
  5)
    read -p "Ingresa el código de región (ej: eu-south-1): " REGION
    ;;
  *)
    echo "Opción inválida, usando eu-west-1 por defecto"
    REGION="eu-west-1"
    ;;
esac

echo ""
echo "✅ Región seleccionada: $REGION"
echo ""

# Actualizar terraform.tfvars si existe
TFVARS_FILE="../terraform/terraform.tfvars"
if [ -f "$TFVARS_FILE" ]; then
  if grep -q "aws_region" "$TFVARS_FILE"; then
    sed -i "s/aws_region.*=.*/aws_region = \"$REGION\"/" "$TFVARS_FILE"
    echo "✅ Actualizado terraform.tfvars"
  else
    echo "aws_region = \"$REGION\"" >> "$TFVARS_FILE"
    echo "✅ Agregado a terraform.tfvars"
  fi
else
  echo "⚠️  terraform.tfvars no existe, se creará con esta región"
fi

echo ""
echo "La región $REGION se usará para crear los recursos."

