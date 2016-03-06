'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var RpcEmpireActions = Reflux.createActions([
    'requestRpcEmpireLogin',
    'successRpcEmpireLogin',
    'failureRpcEmpireLogin',

    'requestRpcEmpireLogout',
    'successRpcEmpireLogout',
    'failureRpcEmpireLogout',
]);

module.exports = RpcEmpireActions;
