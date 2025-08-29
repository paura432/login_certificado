FROM node:20-alpine

WORKDIR /app
RUN npm install -g pnpm

COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY . .
RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "start"]
