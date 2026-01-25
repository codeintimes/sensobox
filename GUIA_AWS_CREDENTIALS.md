# Guía: Cómo obtener credenciales de AWS para Cursor

## Pasos para obtener Access Keys de AWS

### 1. Iniciar sesión en AWS Console
- Ve a: https://console.aws.amazon.com/
- Inicia sesión con tu cuenta de AWS

### 2. Acceder a IAM (Identity and Access Management)
- En la barra de búsqueda superior, escribe: **"IAM"**
- Haz clic en **"IAM"** (Identity and Access Management)

### 3. Ir a la sección de Usuarios
- En el menú lateral izquierdo, haz clic en **"Users"** (Usuarios)
- O directamente: https://console.aws.amazon.com/iam/home#/users

### 4. Seleccionar tu usuario
- Haz clic en tu nombre de usuario (o crea uno nuevo si no tienes)

### 5. Crear Access Key
- Haz clic en la pestaña **"Security credentials"** (Credenciales de seguridad)
- Desplázate hasta la sección **"Access keys"**
- Haz clic en el botón **"Create access key"** (Crear clave de acceso)

### 6. Seleccionar caso de uso
- Selecciona el caso de uso apropiado (por ejemplo: "Application running outside AWS")
- Marca la casilla de confirmación
- Haz clic en **"Next"** (Siguiente)

### 7. Opcional: Agregar descripción
- Puedes agregar una descripción para identificar la clave (ej: "Cursor IDE")
- Haz clic en **"Create access key"** (Crear clave de acceso)

### 8. Copiar las credenciales
⚠️ **IMPORTANTE**: Solo podrás ver la Secret Access Key una vez. Guárdala de forma segura.

- **Access Key ID**: Cópialo inmediatamente
- **Secret Access Key**: Cópialo inmediatamente (haz clic en "Show" si está oculta)

### 9. Configurar en Cursor

Tienes dos opciones:

#### Opción A: Variables de entorno (Recomendado)
Crea un archivo `.env` en la raíz del proyecto o configura las variables en tu sistema:

```bash
AWS_ACCESS_KEY_ID=tu_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_access_key_aqui
AWS_REGION=us-west-1  # o la región que uses
```

#### Opción B: Archivo de credenciales de AWS
Crea el archivo `~/.aws/credentials`:

```ini
[default]
aws_access_key_id = tu_access_key_id_aqui
aws_secret_access_key = tu_secret_access_key_aqui
region = us-west-1
```

## Ubicación visual en AWS Console

```
AWS Console
├── Buscar "IAM" en la barra superior
└── IAM Dashboard
    ├── Menú lateral izquierdo
    │   └── "Users" (Usuarios)
    │       └── [Tu Usuario]
    │           └── Pestaña "Security credentials"
    │               └── Sección "Access keys"
    │                   └── Botón "Create access key" ⬅️ AQUÍ
```

## Notas de seguridad

1. **Nunca compartas tus credenciales** públicamente
2. **No las subas a Git** - agrega `.env` y `~/.aws/` a `.gitignore`
3. **Rota las claves periódicamente** si sospechas que están comprometidas
4. **Usa políticas IAM restrictivas** - solo otorga los permisos necesarios
5. **Considera usar roles IAM** en lugar de Access Keys cuando sea posible

## Si necesitas permisos específicos

Si Cursor necesita acceder a servicios específicos de AWS (como EC2, S3, etc.), asegúrate de que el usuario IAM tenga las políticas adecuadas:

- **EC2**: `AmazonEC2FullAccess` o permisos más específicos
- **S3**: `AmazonS3FullAccess` o permisos más específicos
- **Otros servicios**: Busca en IAM > Policies las políticas necesarias

## Enlaces directos

- **IAM Users**: https://console.aws.amazon.com/iam/home#/users
- **Create Access Key**: https://console.aws.amazon.com/iam/home#/users (selecciona usuario > Security credentials > Create access key)

