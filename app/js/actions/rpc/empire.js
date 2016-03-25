'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var EmpireRPCActions = Reflux.createActions([
    'requestEmpireRPCLogin',
    'successEmpireRPCLogin',
    'failureEmpireRPCLogin',

    'requestEmpireRPCBoost',
    'successEmpireRPCBoost',
    'failureEmpireRPCBoost',

    'requestEmpireRPCInviteFriend',
    'successEmpireRPCInviteFriend',
    'failureEmpireRPCInviteFriend',

    'requestEmpireRPCGetInviteFriendUrl',
    'successEmpireRPCGetInviteFriendUrl',
    'failureEmpireRPCGetInviteFriendUrl',

    'requestEmpireRPCViewBoosts',
    'successEmpireRPCViewBoosts',
    'failureEmpireRPCViewBoosts',

    'requestEmpireRPCLogout',
    'successEmpireRPCLogout',
    'failureEmpireRPCLogout'
]);

module.exports = EmpireRPCActions;
