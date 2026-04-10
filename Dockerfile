FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --production
# Need a simple static server since Vite generates static files
RUN npm install -g serve

EXPOSE 8080

CMD ["serve", "-s", "dist", "-p", "8080"]
