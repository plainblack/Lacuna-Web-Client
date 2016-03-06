'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var RpcStatsActions = Reflux.createActions([
    'requestGetCredits',
    'successGetCredits',
    'failureGetCredits'
]);

module.exports = RpcStatsActions;
