# Simple Dockerfile to build and run the backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json apps/backend/
COPY apps/frontend/package*.json apps/frontend/
RUN npm install --workspaces
COPY . .
RUN npm run build -w backend
EXPOSE 3000
CMD ["node", "apps/backend/dist/index.js"]
