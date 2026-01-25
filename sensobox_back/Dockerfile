# Usa una imagen base de Node.js v21
FROM node:21

# Copia el resto de la aplicación
COPY . ./app/auth

# # Establece el directorio de trabajo en /app
WORKDIR /app/auth

# Copia el archivo .env.example y renómbralo a .env
COPY .env.example .env

# Instala TypeScript de forma global
RUN npm install -g typescript

# # Instala las dependencias del proyecto
RUN npm install --fetch-timeout=600000

# Compila el código TypeScript
# RUN npm run build
# RUN npm run migration:generate

# Expone el puerto 4000 en el contenedor
EXPOSE 4000

# Comando para ejecutar la aplicación en modo de desarrollo
CMD ["npm", "run", "start"]
