# ---- deps ----
    FROM node:20-alpine AS deps
    WORKDIR /app
    RUN corepack enable && corepack prepare pnpm@latest --activate
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    # ---- build ----
    FROM node:20-alpine AS build
    WORKDIR /app
    RUN corepack enable && corepack prepare pnpm@latest --activate
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    RUN pnpm run build
    
    # ---- runtime ----
    FROM node:20-alpine AS runner
    WORKDIR /app
    RUN corepack enable && corepack prepare pnpm@latest --activate
    ENV NODE_ENV=production
    COPY --from=build /app/dist ./dist
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --prod --frozen-lockfile
    EXPOSE 4000
    CMD ["node","dist/server.js"]
    