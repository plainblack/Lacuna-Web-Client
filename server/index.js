'use strict';

var path = require('path');

var express = require('express');
var app = express();

var port = process.env.PORT || 80;

app.use('/lacuna', express.static(path.join(__dirname, '..')));

app.listen(port, function() {
  console.log('Listening on http://localhost:' + port + ' for requests.');
});
