# 🌱 Cómo Ejecutar el Seeder

## Situación Actual

✅ **Módulo Admin creado** con endpoint `POST /admin/seed`
✅ **Código subido al repositorio**
⚠️ **Backend necesita ser desplegado** para que el endpoint esté disponible

## Opción 1: Usar GitHub Actions (Recomendado)

1. **Agrega los secrets de AWS en GitHub:**
   - Ve a: https://github.com/codeintimes/sensobox/settings/secrets/actions
   - Agrega:
     - `AWS_ACCESS_KEY_ID`: Tu access key de AWS
     - `AWS_SECRET_ACCESS_KEY`: Tu secret key de AWS

2. **Ejecuta el workflow manualmente:**
   - Ve a: https://github.com/codeintimes/sensobox/actions
   - Selecciona "Deploy Backend and Seed Database"
   - Click en "Run workflow"
   - Selecciona la rama "main"
   - Click en "Run workflow"

El workflow automáticamente:
- ✅ Desplegará el backend actualizado
- ✅ Ejecutará el seeder para poblar la base de datos

## Opción 2: Desplegar Manualmente y Usar el Endpoint

### Paso 1: Desplegar el Backend

Si tienes acceso al servidor (aunque sea temporal):

```bash
# Conecta al servidor
ssh ubuntu@13.61.115.247

# Despliega el backend
cd /opt/sensobox-backend
git pull origin main
npm install
npm run build
sudo systemctl restart sensobox-backend
```

### Paso 2: Ejecutar el Seeder desde el Navegador

1. **Abre el frontend y haz login:**
   - URL: http://sensobox-frontend.s3-website.eu-north-1.amazonaws.com
   - Login: admin@test.com / password123

2. **Abre la consola del navegador (F12)**

3. **Ejecuta este comando:**

```javascript
fetch('http://13.61.115.247:4000/admin/seed', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Resultado:', data);
  if (data.success) {
    console.log('🎉 Seeder ejecutado exitosamente!');
    console.log('📊 Usuarios creados:', data.usersCreated);
    console.log('📊 Órdenes creadas:', data.ordersCreated);
    // Recargar la página después de 2 segundos
    setTimeout(() => window.location.reload(), 2000);
  } else {
    console.error('❌ Error:', data.message || data.error);
  }
})
.catch(err => {
  console.error('❌ Error de conexión:', err);
  console.log('💡 Asegúrate de que el backend esté desplegado con el módulo Admin');
});
```

4. **Verifica el estado:**

```javascript
fetch('http://13.61.115.247:4000/admin/seed/status', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
  }
})
.then(r => r.json())
.then(data => {
  console.log('📊 Estado de la base de datos:');
  console.log('   Total usuarios:', data.data.totalUsers);
  console.log('   Total órdenes:', data.data.totalOrders);
  console.log('   Usuarios TEST COMPANY:', data.data.testCompanyUsers);
  console.log('   Órdenes TEST COMPANY:', data.data.testCompanyOrders);
});
```

## Opción 3: Ejecutar el Seeder Directamente en el Servidor

Si puedes obtener acceso SSH temporal:

```bash
ssh ubuntu@13.61.115.247
cd /opt/sensobox-backend
sudo systemctl start mongod
git clone https://github.com/codeintimes/sensobox.git /tmp/sensobox-temp
cp /tmp/sensobox-temp/sensobox_back/generate-company-data.ts .
rm -rf /tmp/sensobox-temp
export MONGODB_URL="mongodb://localhost:27017/sensobox"
export NODE_OPTIONS="--max-old-space-size=4096"
npx ts-node generate-company-data.ts
```

## 📊 ¿Qué datos se generan?

- **10 clientes** para TEST COMPANY
- **8 técnicos** para TEST COMPANY
- **3 administradores adicionales** para TEST COMPANY
- **Entre 240-600 órdenes** distribuidas en los últimos 12 meses

Todos los usuarios tienen la contraseña: `password123`

## ✅ Después de Ejecutar

Recarga el frontend para ver los datos en:
- Dashboard (estadísticas)
- Pedidos (lista de órdenes)
- Calendario (eventos)
- Gráficos (visualizaciones)

