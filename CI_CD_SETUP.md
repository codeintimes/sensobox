# 🚀 CI/CD Setup - Inspections Frontend y Backend

## ✅ URLs Finales

### Frontend (Inspections Front)
**URL Principal:**
```
http://inspections-frontend-codeintimes.s3-website-eu-west-1.amazonaws.com
```

**Estado:** ✅ **FUNCIONANDO Y DESPLEGADO**

### Backend (Inspections Back)
**URL Principal:**
```
http://54.216.195.211
```

**Endpoints:**
- Health Check: `http://54.216.195.211/health`
- API Base: `http://54.216.195.211/api`

**Estado:** ⚠️ Pendiente de deployment inicial

## 📋 Workflows de CI/CD Creados

Los workflows ya están creados localmente en:
- `inspections-front/.github/workflows/deploy.yml`
- `inspections-back/.github/workflows/deploy.yml`

### ⚠️ Problema con el Push

El token de GitHub actual no tiene permisos de `workflow`. Para subir los workflows:

**Opción 1: Subir manualmente por la interfaz de GitHub**
1. Ve a cada repositorio en GitHub
2. Crea la carpeta `.github/workflows/` si no existe
3. Crea un nuevo archivo `deploy.yml`
4. Copia el contenido del workflow correspondiente

**Opción 2: Usar un token con permisos de workflow**
1. Ve a GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Crea un nuevo token con el scope `workflow`
3. Actualiza el remote:
```bash
git remote set-url origin https://TU_NUEVO_TOKEN@github.com/codeintimes/inspections-front.git
```

## 🔧 Configurar Secrets en GitHub

Antes de que los workflows funcionen, necesitas agregar estos secrets en cada repositorio:

### Para `codeintimes/inspections-front`:
- Settings → Secrets and variables → Actions → New repository secret
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`

### Para `codeintimes/inspections-back`:
- Settings → Secrets and variables → Actions → New repository secret
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `EC2_INSTANCE_ID` = `i-06eacdbbf6b8cbf80`
  - `EC2_HOST` = `54.216.195.211`
  - `EC2_SSH_PRIVATE_KEY` = (contenido de `~/.ssh/inspections-backend-deploy-key`)

## 📝 Cómo Funciona el CI/CD

### Frontend
- **Trigger:** Push a `main` o `prod` que modifique archivos en `src/`, `angular.json`, `package.json`, o el workflow mismo
- **Proceso:**
  1. Instala dependencias con npm
  2. Build para producción
  3. Sincroniza con S3
  4. Actualiza cache headers

### Backend
- **Trigger:** Push a `main` o `prod` que modifique archivos en `src/`, `package.json`, `nest-cli.json`, o el workflow mismo
- **Proceso:**
  1. Instala dependencias con bun
  2. Build para producción
  3. Crea paquete de deployment
  4. Se conecta al EC2 vía SSH
  5. Despliega y reinicia con PM2
  6. Carga variables de entorno desde AWS Secrets Manager

## 🎯 Próximos Pasos

1. **Subir los workflows a GitHub** (usando una de las opciones arriba)
2. **Configurar los secrets** en GitHub
3. **Hacer un push de prueba** para activar el workflow
4. **Verificar el deployment** en las URLs

## 📍 URLs de Verificación

- **Frontend:** http://inspections-frontend-codeintimes.s3-website-eu-west-1.amazonaws.com
- **Backend:** http://54.216.195.211
- **GitHub Actions:** https://github.com/codeintimes/inspections-front/actions y https://github.com/codeintimes/inspections-back/actions

## ✅ Estado Actual

- ✅ Infraestructura AWS creada
- ✅ Frontend desplegado y funcionando
- ✅ Workflows de CI/CD creados localmente
- ⚠️ Workflows pendientes de subir a GitHub
- ⚠️ Secrets pendientes de configurar
- ⚠️ Backend pendiente de deployment inicial

