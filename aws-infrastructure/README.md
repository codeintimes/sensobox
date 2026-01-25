# AWS Infrastructure para Inspections

Infraestructura como código para desplegar los proyectos inspections-front e inspections-back en AWS.

## Estructura

```
aws-infrastructure/
├── terraform/           # Configuración de Terraform
│   ├── main.tf         # Recursos principales
│   ├── variables.tf    # Variables
│   ├── outputs.tf     # Outputs
│   └── user-data-backend.sh  # Script de inicialización del EC2
├── scripts/            # Scripts de utilidad
│   ├── setup-iam.sh    # Configurar IAM para GitHub Actions
│   ├── setup-secrets.sh # Configurar AWS Secrets Manager
│   └── generate-ssh-key.sh # Generar clave SSH
└── DEPLOYMENT_GUIDE.md # Guía completa de deployment
```

## Quick Start

1. **Configurar Terraform**:
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars
terraform init
terraform apply
```

2. **Configurar IAM**:
```bash
cd ../scripts
chmod +x *.sh
./setup-iam.sh
./generate-ssh-key.sh
```

3. **Configurar GitHub Secrets** (ver DEPLOYMENT_GUIDE.md)

4. **Hacer push a main/prod** y el CI/CD se ejecutará automáticamente

## Recursos Creados

- EC2 t3.micro con Elastic IP
- S3 bucket para frontend
- Security Groups
- IAM roles y políticas
- GitHub Actions workflows (en los repos)

## Costos

~$10-15/mes

## Documentación Completa

Ver [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para instrucciones detalladas.

