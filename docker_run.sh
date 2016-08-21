#!/bin/bash

# Getting docker listen address.
if ["$TLE_CLIENT_LISTEN" eq ""]; then
    TLE_CLIENT_LISTEN=`ifconfig docker0 2>/dev/null|awk '/inet addr:/ {print $2}'|sed 's/addr://'`
fi

INDEX_HTML_ALTERED=""
LACUNA_DOCKER_NAME="lacuna/tle-client"

docker_run() {
    docker run -d -p ${TLE_CLIENT_LISTEN:-0.0.0.0}:${TLE_CLIENT_PORT:-8080}:80  \
        -v ${PWD}/app:/src/app \
        -v ${PWD}/gulp-tasks:/src/gulp-tasks \
        -v ${PWD}/index.html:/src/index.html \
        -v ${PWD}/lacuna/assets:/src/lacuna/assets \
        --name=tle-client \
        -e DEBUG=express:* \
        $LACUNA_DOCKER_NAME gulp dev-with-server
}

docker_start() {
    echo "Starting container $1"
    docker start $1
}

docker_stop() {
    echo "Stopping container $1"
    docker stop $1
}

docker_generate_config() {
    cat > index.docker.conf << EOF
# Local docker container listen address and port. Assigned automatically, usually you
# don't want to change this.
TLE_CLIENT_LISTEN="${TLE_CLIENT_LISTEN:-localhost}"
TLE_CLIENT_PORT="${TLE_CLIENT_PORT:-8080}"

# Local loader script path.
TLE_LOAD_SCRIPT="lacuna/load.js"

# Server-side RPC url. For working with production server, use "http://us1.lacunaexpanse.com/"
# For testing you may use your local Lacuna Server setup, e.g. "http://192.168.99.100:5000/"
# Trailing slash is required.
LACUNA_RPC_BASE_URL="http://us1.lacunaexpanse.com/"

# Amazon s3 cloud assets address.
LACUNA_S3_BASE_URL="//d16cbq0l6kkf21.cloudfront.net/"

# Some values you probably wish to change sometimes on your local repo.
LACUNA_YII_LOADER_SRC="//ajax.googleapis.com/ajax/libs/yui/2.8.1/build/yuiloader/yuiloader-min.js"
LACUNA_JQUERY_SRC="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"
LACUNA_PNOTIFY_JS_SRC="//cdnjs.cloudflare.com/ajax/libs/pnotify/2.0.0/pnotify.all.min.js"
LACUNA_PNOTIFY_CSS_SRC="//cdnjs.cloudflare.com/ajax/libs/pnotify/2.0.0/pnotify.all.min.css"
LACUNA_FAVICON="http://s3.amazonaws.com/www.lacunaexpanse.com/favicon.png"
LACUNA_SHORTCUT_ICON="http://s3.amazonaws.com/www.lacunaexpanse.com/favicon.ico"
LACUNA_PULSE_INDICATOR="//s3.amazonaws.com/us1.lacunaexpanse.com/assets/ui/pulse-indicator.gif"

EOF
}

docker_generate_index() {
    # Getting variables from config file.
    source index.docker.conf

    cat > index.html << EOF
<!-- this file was generated automatically by docker_run.sh -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Lacuna Expanse</title>
        <link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/yui/2.8.1/build/reset-fonts-grids/reset-fonts-grids.css" />
        <link rel="stylesheet" type="text/css" href="http://$TLE_CLIENT_LISTEN:$TLE_CLIENT_PORT/lacuna/styles.css" />
        <link href="$LACUNA_PNOTIFY_CSS_SRC" rel="stylesheet">
        <link rel="icon" href="$LACUNA_FAVICON" type="image/png" />
        <link rel="SHORTCUT ICON" href="$LACUNA_SHORTCUT_ICON" />
</head>
<body id="body" class="yui-skin-sam">
    <div id="pulsing" class="nofooter yui-panel">
        <div class="bd">
            <img src="$LACUNA_PULSE_INDICATOR" alt="Pulse Indicator" />
        </div>
    </div>
    <div id="header" class="yui-gb hidden">
        <div id="headerShine"></div>
        <div id="usersCenter">
            <div id="usersArrow"></div>
            <div id="users">Users Menu</div>
            <div id="userMenu"></div>
        </div>
        <div id="userCenterShine"></div>
        <div id="userClick"></div>
    </div>
    <div id="content">
        <div id="nojavascript">
            Lacuna Expanse requires Javascript to run.  Please enable and reload the page.
        </div>
    </div>
    <div id="footer" class="yui-gb hidden"  style="bottom: 25px;">
        <div id="footerShine"></div>
        <div id="planetsCenter">
            <div id="planetsArrow"></div>
            <div id="planets">Planet Menu</div>
            <div id="planetMenu"></div>
        </div>
        <div id="planetsCenterShine"></div>
        <div id="planetsClick"></div>
    </div>

    <script id="noJsScript" type="text/javascript">
        (function(){
            //remove noscript notice
            var nojs = document.getElementById("nojavascript");
            if(nojs) {
                nojs.parentNode.removeChild(nojs);
            }
            //remove script node as well
            var njs = document.getElementById("noJsScript");
            njs.parentNode.removeChild(njs);
        })();
    </script>
    <!-- <script type="text/javascript" src="$LACUNA_YII_LOADER_SRC"></script> -->
    <script type="text/javascript">
      lacuna_rpc_base_url = '$LACUNA_RPC_BASE_URL';
      lacuna_s3_base_url = '$LACUNA_S3_BASE_URL';
    </script>
    <script type="text/javascript" src="$LACUNA_YII_LOADER_SRC"></script>
    <script type="text/javascript" src="http://$TLE_CLIENT_LISTEN:$TLE_CLIENT_PORT/$TLE_LOAD_SCRIPT"></script>
    <script type="text/javascript" src="$LACUNA_JQUERY_SRC"></script>
    <script type="text/javascript" src="$LACUNA_PNOTIFY_JS_SRC"></script>
</body>
</html>
EOF
}

open_browser_url() {
    # Fetching configuration file
    source index.docker.conf

    URL="http://$TLE_CLIENT_LISTEN:$TLE_CLIENT_PORT/"
    [[ -x $BROWSER ]] && exec "$BROWSER" "$URL"
    path=$(which xdg-open || which gnome-open) && exec "$path" "$URL"
    echo "Can't find browser"
}

if [ ! -f index.docker.conf ]; then
    echo "Writing index.html.conf configuration file"
    docker_generate_config
fi

if [ ! -f index.html ]; then
    echo "Generating index.html"
    docker_generate_index
    INDEX_HTML_ALTERED="1"
fi

if [ `stat -c %Y index.html` != `stat -c %Y index.docker.conf` ]; then
    echo "Configuration file was altered, writing new index.html"
    docker_generate_index
    touch index.docker.conf
    INDEX_HTML_ALTERED="1"
fi

# Check if docker container exists
DOCKER_CONTAINER_ID=`docker ps -a | grep $LACUNA_DOCKER_NAME | awk '{print $1}'`
# Check if docker container is currently running.
DOCKER_RUNNING=`docker ps | grep $LACUNA_DOCKER_NAME`

if [ "$DOCKER_RUNNING" == "" ]; then
    if [ "$DOCKER_CONTAINER_ID" != "" ]; then
        docker_start $DOCKER_CONTAINER_ID
    else
        # Create new container called $LACUNA_DOCKER_NAME
        docker_run
    fi
fi

open_browser_url