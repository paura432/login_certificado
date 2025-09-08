# ---- build ----
    FROM node:20-alpine AS build
    WORKDIR /app
    RUN corepack enable && corepack prepare pnpm@latest --activate
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    RUN mkdir -p public   # 👈 asegura que exista
    ENV NEXT_TELEMETRY_DISABLED=1
    RUN pnpm run build
    