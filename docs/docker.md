## A quick start to running Lacuna Expanse Server in Docker

Docker is a quick and easy way to get a development system up and running so you can experiment
and modify the Lacuna Expanse code.

Please read the documents at ![Install Docker Engine](https://docs.docker.com/engine/installation/)
for your specific system.

(There are a few additional notes below based on our experience of installing Docker)

### Installing on OS X.

On OS X Docker runs in a Virtual Box, the default base memory is 1024 MB but
it might be too little, in which case you need to set higher, say 8196 as
follows. (Note this will blow-away your current docker containers if you have
any!)

    $ docker-machine rm default
    $ docker-machine create --driver virtualbox --virtualbox-memory 8096 default
    $ eval "$(docker-machine env default)"

## Setting up your dev environment

You need to checkout the code from github into a local directory as normal, I
will assume you are checking out to

    ~/Lacuna-Web-Client

You need to create some config files for the docker config,

Out of the Box, this docker container assumes that you are running the client
on your localhost on port 8080 and that you are using the us1.lacunaexpanse.com
server as the back-end. (these can be changed if need-be).

First of all create the index.html file


    $ cd ~/Lacuna-Web-Client
    $ cp index.html.docker index.html

(You may now edit index.html if you want to change any of the defaults)

Now build and run the docker image

    $ ./docker_build.sh
    $ ./docker_run.sh
    src# npm update
    src# npm install
    src# bower install --allow-root
    src# gulp dev

Your client code is now up and running at !(http://localhost:8080/index.html)

### Changing the server or port

If you want to run this client code on a server other than !(http://localhost:8080)
then you can change the run command to

    $ TLE_CLIENT_LISTEN=0.0.0.0 TLE_CLIENT_PORT=80 ./docker_run.sh

This will make the client listen on any server (visible to the world) and on port 80.

You may also need to make changes to index.html (for example, if you run your own
server code).


