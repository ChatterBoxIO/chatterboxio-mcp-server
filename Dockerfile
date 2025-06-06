# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
# syntax=docker/dockerfile:1
FROM node:lts-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and tsconfig
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY src ./src

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:lts-alpine AS runner
WORKDIR /app
# Copy built files and production dependencies
COPY --from=builder /app/build ./build
COPY package.json pnpm-lock.yaml ./

# Install production dependencies
RUN npm install --production

# Default command
ENTRYPOINT ["node", "build/index.js"]
