#!/bin/bash
set -e

# Script para configurar IAM roles y políticas necesarias para CI/CD

AWS_REGION=${AWS_REGION:-eu-west-1}
GITHUB_ORG="codeintimes"
GITHUB_REPO_FRONTEND="inspections-front"
GITHUB_REPO_BACKEND="inspections-back"

echo "🔐 Setting up IAM for GitHub Actions CI/CD..."

# Crear IAM User para GitHub Actions
USER_NAME="github-actions-deployer"
echo "Creating IAM user: $USER_NAME"

aws iam create-user --user-name $USER_NAME 2>/dev/null || echo "User already exists"

# Crear política para deployment
cat > /tmp/github-actions-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::inspections-frontend-codeintimes",
        "arn:aws:s3:::inspections-frontend-codeintimes/*",
        "arn:aws:s3:::inspections-backend-assets-codeintimes",
        "arn:aws:s3:::inspections-backend-assets-codeintimes/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "*"
    }
  ]
}
EOF

POLICY_NAME="GitHubActionsDeployPolicy"
POLICY_ARN=$(aws iam create-policy \
  --policy-name $POLICY_NAME \
  --policy-document file:///tmp/github-actions-policy.json \
  --query 'Policy.Arn' \
  --output text 2>/dev/null || \
  aws iam get-policy --policy-arn "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$POLICY_NAME" --query 'Policy.Arn' --output text)

echo "Policy ARN: $POLICY_ARN"

# Attach policy to user
aws iam attach-user-policy \
  --user-name $USER_NAME \
  --policy-arn $POLICY_ARN

# Crear access keys
echo "Creating access keys..."
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name $USER_NAME --output json)
ACCESS_KEY_ID=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.SecretAccessKey')

echo ""
echo "✅ IAM setup completed!"
echo ""
echo "📋 Add these secrets to your GitHub repositories:"
echo ""
echo "For $GITHUB_ORG/$GITHUB_REPO_FRONTEND:"
echo "  AWS_ACCESS_KEY_ID = $ACCESS_KEY_ID"
echo "  AWS_SECRET_ACCESS_KEY = $SECRET_ACCESS_KEY"
echo ""
echo "For $GITHUB_ORG/$GITHUB_REPO_BACKEND:"
echo "  AWS_ACCESS_KEY_ID = $ACCESS_KEY_ID"
echo "  AWS_SECRET_ACCESS_KEY = $SECRET_ACCESS_KEY"
echo "  EC2_INSTANCE_ID = <your-ec2-instance-id>"
echo "  EC2_HOST = <your-ec2-elastic-ip>"
echo "  EC2_SSH_PRIVATE_KEY = <your-ssh-private-key>"
echo ""
echo "⚠️  IMPORTANT: Save the Secret Access Key now, you won't be able to see it again!"
echo ""

# Cleanup
rm -f /tmp/github-actions-policy.json

