FROM node:14-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force
RUN npm install --force
COPY . .
CMD ["node", "index.js"]
