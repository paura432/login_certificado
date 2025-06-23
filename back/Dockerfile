FROM node:22

WORKDIR /tmp/demos/login-cert/back

COPY . .

ENV CI=true

RUN  npm install -g pnpm && \
    pnpm install

RUN pnpm run build

EXPOSE 4430 4431 4432

CMD ["pnpm", "start"]