'use strict';

var StarmapActions  = require('js/actions/starmap');
var SessionStore    = require('js/stores/session');
var server          = require('js/server');

// Convert a user request for a get_star_chunk rpc into a server request
// on success, create a getStarChunk event
//
StarmapActions.rpcGetStarChunk.listen(function(o) {
    console.log('Starmap Action: rpcStarChunk [' + o.xChunk + '][' + o.yChunk + ']');

    server.call({
        module:     'map',
        method:     'get_star_chunk',
        params:     [{x_chunk: o.xChunk, y_chunk: o.yChunk}],
        success:    function() {
            console.log('Starmap Action: rpcStarChunk REPLY');
            StarmapActions.getStarChunk();
        }
    });
});


