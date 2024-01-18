###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 AS development
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /app

ENV NODE_ENV development

COPY --chown=node:node pnpm-lock.yaml ./
COPY --chown=node:node package.json ./

RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

RUN pnpm prisma generate

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:18 AS build
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /app

ENV NODE_ENV production

COPY --chown=node:node pnpm-lock.yaml ./

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN pnpm build

RUN pnpm install --prod

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV production

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/prisma ./prisma
COPY --chown=node:node --from=build /app/templates ./templates

CMD [ "node", "dist/main.js" ]
