# Using Docker

Information about Docker can be found at ![The Official Docker Web Site](http://docs.docker.com)

There is a Docker container which is pre-built with node, bower, gulp etc. All you have to
do is to download and run it and in a few minutes you have a running Web Client.

    $ cp index.html.docker index.html
    $ ./docker_run.sh
    # gulp dev

That's it!

# Configuration

By default the index.html file will refer to the game server !(http://us1.lacunaexpanse.com)
and it will assume your Web Client is running on !(http://localhost:8080). 

If however you wanted to run this on your own server, or you also wanted to hack the
Lacuna-Server-Open code then you could do the following.

## Also running Lacuna-Server-Open on your localhost

    $ diff index.html.docker index.html
    60c60
    <       lacuna_rpc_base_url = 'http://us1.lacunaexpanse.com:80/';
    ---
    >       lacuna_rpc_base_url = 'http://localhost:8000/';

    $ ./docker_run.sh

## Running Lacuna-Server-Open on your own server

    $ diff index.html.docker index.html
    8c8
    <         <link rel="stylesheet" type="text/css" href="http://localhost:8080/lacuna/styles.css" />
    ---
    >         <link rel="stylesheet" type="text/css" href="http://my.server.com:8080/lacuna/styles.css" />
    60c60
    <       lacuna_rpc_base_url = 'http://us1.lacunaexpanse.com:80/';
    ---
    >       lacuna_rpc_base_url = 'http://my.server.com:8000/';
    64c64
    <     <script type="text/javascript" src="http://localhost:8080/lacuna/load.js"></script>
    ---
    >     <script type="text/javascript" src="http://my.server.com:8080/lacuna/load.js"></script>

    $ TLE_CLIENT_LISTEN=0.0.0.0 ./docker_run.sh

## Running Lacuna-Server-Open and Lacuna-Web-Client on a Mac

On OS X docker is run in a virtualbox. You will need to know the IP address of this
box, e.g. 192.168.99.105

    $ diff index.html.docker index.html
    8c8
    <         <link rel="stylesheet" type="text/css" href="http://localhost:8080/lacuna/styles.css" />
    ---
    >         <link rel="stylesheet" type="text/css" href="http://192.168.99.105:8080/lacuna/styles.css" />
    60c60
    <       lacuna_rpc_base_url = 'http://us1.lacunaexpanse.com:80/';
    ---
    >       lacuna_rpc_base_url = 'http://192.168.99.105:8000/';
    64c64
    <     <script type="text/javascript" src="http://localhost:8080/lacuna/load.js"></script>
    ---
    >     <script type="text/javascript" src="http://192.168.99.105:8080/lacuna/load.js"></script>

    $ TLE_CLIENT_LISTEN=0.0.0.0 ./docker_run.sh

In this case, the client (running on the virtualbox) needs to accept external requests
(from your OS X localhost) which is why the 0.0.0.0 address is used.

Since the server is also running on the virtualbox, then you need it's IP address to be
specified in index.html


