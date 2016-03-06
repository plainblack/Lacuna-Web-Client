'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var RpcStatsActions = Reflux.createActions([
    'requestStatsGetCredits',
    'successStatsGetCredits',
    'failureStatsGetCredits'
]);

module.exports = RpcStatsActions;
