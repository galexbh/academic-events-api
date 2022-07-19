FROM node:16

ADD package.json /tmp/package.json

ADD package.json.lock /tmp/package.json.lock

RUN rm -rf build

RUN cd /tmp && npm install

ADD ./ /src

RUN rm -rf src/node_modules && cp -a /tmp/node_modules /src/

WORKDIR /src

RUN npm run build

ARG PORT

ARG EMAIL_ADDRESS

ARG SENDGRID_API_KEY

ARG MONGO_CONNECTION_KEY

ARG ACCESS_TOKEN_PUBLIC_KEY
ARG ACCESS_TOKEN_PRIVATE_KEY
ARG REFRESH_PRIVATE_KEY
ARG REFRESH_PUBLIC_KEY

EXPOSE 3000

CMD ["node", "build/src/app/backend/start.js"]