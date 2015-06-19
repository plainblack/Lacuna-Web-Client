'use strict';

var Reflux = require('reflux');

var TickerActions = Reflux.createActions([
    'start',
    'stop',
    'tick'
]);

module.exports = TickerActions;
