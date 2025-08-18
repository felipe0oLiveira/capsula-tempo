# Dockerfile para o Backend
FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY backend/package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY backend/ ./

# Expor porta
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
