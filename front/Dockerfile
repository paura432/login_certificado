FROM node:22

WORKDIR /tmp/demos/login-cert/front

COPY . .

ENV CI=true

RUN  npm install -g pnpm && \
    pnpm install

CMD ["pnpm", "run", "dev"]