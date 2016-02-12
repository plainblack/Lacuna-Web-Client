'use strict';

var Reflux = require('reflux');

var StatsActions = Reflux.createActions([
    'load',
    'show',
    'hide'
]);

module.exports = StatsActions;
