FROM node:alpine

RUN apk add --upgrade --no-cache \
    bash \
    make \
    g++ \
    python \
    cyrus-sasl-dev \
    libressl2.5-libcrypto --repository http://dl-3.alpinelinux.org/alpine/edge/main/ --allow-untrusted \
    libressl2.5-libssl --repository http://dl-3.alpinelinux.org/alpine/edge/main/ --allow-untrusted \
    librdkafka-dev --repository http://dl-3.alpinelinux.org/alpine/edge/community/ --allow-untrusted

ENV BUILD_LIBRDKAFKA=0

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN yarn install

CMD ["yarn", "start"]
