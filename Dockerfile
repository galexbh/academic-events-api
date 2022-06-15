FROM node:16-slim

WORKDIR /code

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
