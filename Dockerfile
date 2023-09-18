# syntax=docker/dockerfile:1

FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /guide_app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

EXPOSE 6700


CMD ["node", "app.js"]
