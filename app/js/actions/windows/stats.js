'use strict';

var Reflux = require('reflux');

var StatsWindowActions = Reflux.createActions([
    'statsWindowLoad',
    'statsWindowShow',
    'statsWindowHide'
]);

module.exports = StatsWindowActions;
