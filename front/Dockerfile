# ---- deps ----
    FROM node:20-alpine AS deps
    WORKDIR /app
    RUN apk add --no-cache libc6-compat \
     && corepack enable && corepack prepare pnpm@latest --activate
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    # ---- build ----
    FROM node:20-alpine AS build
    WORKDIR /app
    RUN corepack enable && corepack prepare pnpm@latest --activate
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    ENV NEXT_TELEMETRY_DISABLED=1
    RUN pnpm run build
    
    # ---- runtime ----
    FROM node:20-alpine AS runner
    WORKDIR /app
    RUN corepack enable && corepack prepare pnpm@latest --activate
    ENV NODE_ENV=production
    # solo lo necesario para ejecutar
    COPY --from=build /app/.next ./.next
    COPY --from=build /app/public ./public
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --prod --frozen-lockfile
    EXPOSE 3000
    CMD ["pnpm","start"]
    