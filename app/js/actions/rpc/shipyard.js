'use strict';

var Reflux  = require('reflux');

var ShipyardRPCActions = Reflux.createActions([
    'requestShipyardRPCView',
    'successShipyardRPCView',
    'failureShipyardRPCView',

    'requestShipyardRPCViewBuildQueue',
    'successShipyardRPCViewBuildQueue',
    'failureShipyardRPCViewBuildQueue',

    'requestShipyardRPCSubsidizeBuildQueue',
    'successShipyardRPCSubsidizeBuildQueue',
    'failureShipyardRPCSubsidizeBuildQueue',

    'requestShipyardRPCSubsidizeFleet',
    'successShipyardRPCSubsidizeFleet',
    'failureShipyardRPCSubsidizeFleet',

    'requestShipyardRPCBuildFleet',
    'successShipyardRPCBuildFleet',
    'failureShipyardRPCBuildFleet',

    'requestShipyardRPCGetBuildable',
    'successShipyardRPCGetBuildable',
    'failureShipyardRPCGetBuildable',

    'requestShipyardRPCGetRepairable',
    'successShipyardRPCGetRepairable',
    'failureShipyardRPGetRepairable',

    'requestShipyardRPCRepairFleet',
    'successShipyardRPCRepairFleet',
    'failureShipyardRPCRepairFleet'

]);

module.exports = ShipyardRPCActions;
