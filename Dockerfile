# Stage 1: Development
FROM node:18-alpine3.18 AS development

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY .env.docker .env

RUN yarn

COPY . .

RUN yarn build

# Stage 2: Production
FROM node:18-alpine3.18 AS production

WORKDIR /app

COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/package*.json ./
COPY --from=development /app/dist ./dist
COPY --from=development /app/prisma ./prisma

CMD [ "node", "dist/main.js" ]
