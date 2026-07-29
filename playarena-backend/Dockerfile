FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules node_modules
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY package.json ./
RUN npx prisma generate
COPY . .

EXPOSE 3000
CMD npx prisma migrate deploy && node server.js
