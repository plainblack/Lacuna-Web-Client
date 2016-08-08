'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var StatsRPCActions = Reflux.createActions([
    'requestStatsRPCGetCredits',
    'successStatsRPCGetCredits',
    'failureStatsRPCGetCredits'
]);

module.exports = StatsRPCActions;
