'use strict';

var Reflux = require('reflux');

var ServerStatusActions = Reflux.createActions([
    'serverStatusUpdate',
    'serverStatusClear',
    'serverStatusTime'
]);

module.exports = ServerStatusActions;
