docker run -it --rm -p ${TLE_CLIENT_LISTEN:-0.0.0.0}:${TLE_CLIENT_PORT:-8080}:80  \
    -v ${PWD}/app:/src/app \
    -v ${PWD}/gulp-tasks:/src/gulp-tasks \
    -v ${PWD}/index.html:/src/index.html \
    -v ${PWD}/lacuna/assets:/src/lacuna/assets \
    --name=tle-client \
    -e DEBUG=express:* \
    lacuna/tle-client /bin/bash

