FROM node:latest

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


