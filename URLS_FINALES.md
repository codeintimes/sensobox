# 🌐 URLs Finales - Inspections Frontend y Backend

## ✅ FRONTEND (Funcionando)

**URL Principal:**
```
http://inspections-frontend-codeintimes.s3-website-eu-west-1.amazonaws.com
```

**Estado:** ✅ **FUNCIONANDO Y VISIBLE**
- Página de login cargando correctamente
- Todos los recursos (JS, CSS, imágenes) cargando
- Configurado para conectarse al backend en `http://54.216.195.211/api`

## ⚠️ BACKEND (Pendiente de deployment inicial)

**URL Principal:**
```
http://54.216.195.211
```

**Endpoints:**
- Health Check: `http://54.216.195.211/health`
- API Base: `http://54.216.195.211/api`

**Estado:** ⚠️ Nginx funcionando, aplicación backend pendiente de deployment

## 📋 Información de Infraestructura

- **EC2 Instance ID:** `i-06eacdbbf6b8cbf80`
- **Elastic IP:** `54.216.195.211` (permanente, no cambiará)
- **S3 Bucket:** `inspections-frontend-codeintimes`
- **Región:** eu-west-1

## 🚀 CI/CD Configurado

Los workflows de GitHub Actions están listos para:
- **Frontend:** Deploy automático a S3 en cada push a `main` o `prod`
- **Backend:** Deploy automático a EC2 en cada push a `main` o `prod`

### Para activar CI/CD:
1. Subir los workflows a GitHub (ver `CI_CD_SETUP.md`)
2. Configurar secrets en GitHub
3. Hacer push a `main` o `prod`

## 📝 Notas

- El frontend está completamente funcional y visible
- El backend necesita el deployment inicial (puede hacerse manualmente o vía GitHub Actions)
- La Elastic IP es permanente y siempre apuntará a tu instancia
- Una vez desplegado el backend, el frontend se conectará automáticamente

