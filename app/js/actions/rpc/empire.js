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

    'requestEmpireRPCViewAuthorizedSitters',
    'successEmpireRPCViewAuthorizedSitters',
    'failureEmpireRPCViewAuthorizedSitters',

    'requestEmpireRPCAuthorizeSitters',
    'successEmpireRPCAuthorizeSitters',
    'failureEmpireRPCAuthorizeSitters',

    'requestEmpireRPCDeauthorizeSitters',
    'successEmpireRPCDeauthorizeSitters',
    'failureEmpireRPCDeauthorizeSitters',

    'requestEmpireRPCEnableSelfDestruct',
    'successEmpireRPCEnableSelfDestruct',
    'failureEmpireRPCEnableSelfDestruct',

    'requestEmpireRPCDisableSelfDestruct',
    'successEmpireRPCDisableSelfDestruct',
    'failureEmpireRPCDisableSelfDestruct',

    'requestEmpireRPCRedeemEssentiaCode',
    'successEmpireRPCRedeemEssentiaCode',
    'failureEmpireRPCRedeemEssentiaCode',

    'requestEmpireRPCLogout',
    'successEmpireRPCLogout',
    'failureEmpireRPCLogout'
]);

module.exports = EmpireRPCActions;
