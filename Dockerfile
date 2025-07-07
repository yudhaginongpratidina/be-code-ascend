# ========================
# STAGE 1: Builder
# ========================
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Install full dependencies (with Prisma CLI in devDependencies)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy schema and run prisma generate
COPY prisma ./prisma
RUN pnpm prisma generate

# Copy remaining source code
COPY . .

# ========================
# STAGE 2: Production
# ========================
FROM node:22-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

# Copy only production dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy generated Prisma client and relevant app code
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# If needed, copy only necessary source files
COPY . .

EXPOSE 4000

CMD ["pnpm", "run", "start"]