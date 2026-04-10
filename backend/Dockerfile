FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Assuming index.ts runs directly with ts-node in dev, or we need to build.
# The current backend package.json relies on ts-node-dev for start. Let's install typescript & ts-node globally or locally to run it, or compile it.
# Actually, the best way for production is to compile, but let's just use ts-node to ensure it works exactly like dev.

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY src ./src/
COPY tsconfig.json ./

RUN npm install
RUN npx prisma generate

ENV NODE_ENV=production
ENV PORT=3000

# Push schema to SQLite and run seed (good for ephemeral MVP demo on Cloud Run)
RUN npx prisma db push --accept-data-loss
RUN npx ts-node prisma/seed.ts

# Cloud Run needs to bind to 0.0.0.0 and process.env.PORT
CMD ["npx", "ts-node", "src/index.ts"]
