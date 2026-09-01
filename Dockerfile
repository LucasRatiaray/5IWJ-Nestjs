FROM node:22.23.2-alpine3.24 AS build
WORKDIR /home/node/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22.23.2-alpine3.24 AS runtime
WORKDIR /home/node/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /home/node/app/dist ./dist

USER node
EXPOSE 3000

CMD ["sh", "-c", "npm run migration:run:prod && npm run seed:admin:prod && npm run start:prod"]
