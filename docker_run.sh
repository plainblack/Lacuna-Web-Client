docker run -it --rm -p ${TLE_CLIENT_LISTEN:-127.0.0.1}:${TLE_CLIENT_PORT:-8080}:8080  \
    -v ${PWD}/app:/src/app \
    -v ${PWD}/index.html:/src/index.html \
    --name=tle-client \
    icydee/tle-client /bin/bash

