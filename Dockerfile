FROM node:latest

RUN echo "1.7"
COPY ${PWD}/package.json /src/package.json
COPY ${PWD}/Gulpfile.js /src/Gulpfile.js
COPY ${PWD}/bower.json /src/bower.json
COPY ${PWD}/package.json /src/package.json

WORKDIR /src

RUN npm update
RUN npm install -g gulp
RUN npm install -g bower
RUN npm install
RUN bower install --allow-root

RUN mkdir -p /src/lacuna

