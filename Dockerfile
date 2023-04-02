FROM node:18-alpine
WORKDIR /opt/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build