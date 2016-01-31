docker run -it --rm -p ${TLE_CLIENT_LISTEN:-127.0.0.1}:${TLE_CLIENT_PORT:-8080}:8080  \
    -v ${PWD}/app:/src/app \
    -v ${PWD}/index.html:/src/index.html \
    -v ${PWD}/lacuna/assets:/src/lacuna/assets \
    --name=tle-client \
    lacuna/tle-client /bin/bash

