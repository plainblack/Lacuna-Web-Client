'use strict';

var express = require('express');
var path    = require('path');

module.exports = function(done) {
    var app = express();
    var port = process.env.PORT || 8080;
    app.use(express.static(path.join(__dirname)));

    app.listen(port, function() {
        console.log('Listening on http://localhost:' + port + ' for requests.');
        done();
    });
};
