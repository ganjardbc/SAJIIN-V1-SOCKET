# FROM node:14-alpine as build-stage
# WORKDIR /app
# COPY package*.json ./
# RUN npm cache clean --force
# RUN npm install --force
# COPY . .
# CMD ["node", "index.js"]


FROM node:14-alpine as build-stage
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY src/package.json src/package-lock.json .
RUN npm install
COPY src/ .
EXPOSE 8082
CMD [ "npm", "start"]