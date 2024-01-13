# Stage 1: build
FROM node:18-alpine3.18 AS build

WORKDIR /app

COPY package*.json ./

RUN yarn install --frozen-lockfile

COPY prisma ./prisma/
COPY templates ./templates
COPY . .

RUN yarn prisma generate
RUN yarn build

# Stage 2: Production
FROM node:18-alpine3.18 AS production

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/templates ./templates
COPY --from=build /app/dist ./dist

CMD [ "node", "dist/main.js" ]
