FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
RUN npm install
COPY src ./src/
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --production
RUN npm install -g typescript ts-node
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

ENV NODE_ENV=production
ENV PORT=3000

# Push schema to SQLite and run seed (good for ephemeral MVP demo on Cloud Run)
RUN npx prisma db push --accept-data-loss
COPY tsconfig.json ./
RUN npx ts-node prisma/seed.ts

EXPOSE 3000

# Cloud Run needs to bind to 0.0.0.0 and process.env.PORT
CMD ["node", "dist/index.js"]
