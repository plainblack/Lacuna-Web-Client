'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var EmpireRPCActions = Reflux.createActions([
    'requestRPCEmpireLogin',
    'successRPCEmpireLogin',
    'failureRPCEmpireLogin',

    'requestRPCEmpireBoost',
    'successRPCEmpireBoost',
    'failureRPCEmpireBoost',
    
    'requestRPCEmpireLogout',
    'successRPCEmpireLogout',
    'failureRPCEmpireLogout'
]);

module.exports = EmpireRPCActions;
