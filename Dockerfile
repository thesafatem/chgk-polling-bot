FROM node:18-alpine
WORKDIR /opt/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build