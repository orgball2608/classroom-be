# Stage 1: Development
FROM node:18-alpine3.18 AS development

WORKDIR /app

COPY package*.json ./
COPY .env.docker .env

RUN yarn install --frozen-lockfile

COPY prisma ./prisma/
COPY templates ./templates
COPY . .

RUN yarn prisma generate
RUN yarn build

# Stage 2: Production
FROM node:18-alpine3.18 AS production

WORKDIR /app

COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/package*.json ./
COPY --from=development /app/prisma ./prisma
COPY --from=development /app/templates ./templates
COPY --from=development /app/dist ./dist

CMD [ "node", "dist/main.js" ]
