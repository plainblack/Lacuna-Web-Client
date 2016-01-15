FROM node:latest

COPY ${PWD}/package.json /src/package.json

WORKDIR /src

RUN npm install -g gulp
RUN npm install -g bower



