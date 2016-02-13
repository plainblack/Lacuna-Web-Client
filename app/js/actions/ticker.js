'use strict';

var Reflux = require('reflux');

var TickerActions = Reflux.createActions([
    'tickerStart',
    'tickerStop',
    'tickerTick'
]);

module.exports = TickerActions;
