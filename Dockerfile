FROM node:22-alpine

WORKDIR /app

# Copy package.json dan lockfile dulu untuk caching install
COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

# Copy seluruh source code setelah dependencies terinstall
COPY . .

# Sekarang jalankan prisma generate, karena schema.prisma sudah ada di container
RUN pnpm prisma generate
RUN pnpm prisma db push

EXPOSE 4000

CMD ["pnpm", "run", "start"]
