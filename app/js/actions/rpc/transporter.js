'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var TransporterRPCActions = Reflux.createActions([
    'requestTransporterRPCView',
    'successTransporterRPCView',
    'failureTransporterRPCView',

    'requestTransporterRPCReportAbuse',
    'successTransporterRPCReportAbuse',
    'failureTransporterRPCReportAbuse',

    'requestTransporterRPCViewMyMarket',
    'successTransporterRPCViewMyMarket',
    'failureTransporterRPCViewMyMarket',

    'requestTransporterRPCViewMarket',
    'successTransporterRPCViewMarket',
    'failureTransporterRPCViewMarket',

    'requestTransporterRPCAcceptFromMarket',
    'successTransporterRPCAcceptFromMarket',
    'failureTransporterRPCAcceptFromMarket',

    'requestTransporterRPCWithdrawFromMarket',
    'successTransporterRPCWithdrawFromMarket',
    'failureTransporterRPCWithdrawFromMarket',

    'requestTransporterRPCAddToMarket',
    'successTransporterRPCAddToMarket',
    'failureTransporterRPCAddToMarket',

    'requestTransporterRPCPushItems',
    'successTransporterRPCPushItems',
    'failureTransporterRPCPushItems',

    'requestTransporterRPCTradeOneForOne',
    'successTransporterRPCTradeOneForOne',
    'failureTransporterRPCTradeOneForOne',

    'requestTransporterRPCGetStoredResources',
    'successTransporterRPCGetStoredResources',
    'failureTransporterRPCGetStoredResources',

    'requestTransporterRPCGetFleets',
    'successTransporterRPCGetFleets',
    'failureTransporterRPCGetFleets',

    'requestTransporterRPCGetFleetSummary',
    'successTransporterRPCGetFleetSummary',
    'failureTransporterRPCGetFleetSummary',

    'requestTransporterRPCGetPrisoners',
    'successTransporterRPCGetPrisoners',
    'failureTransporterRPCGetPrisoners',

    'requestTransporterRPCGetPlanSummary',
    'successTransporterRPCGetPlanSummary',
    'failureTransporterRPCGetPlanSummary',

    'requestTransporterRPCGetGlyphSummary',
    'successTransporterRPCGetGlyphSummary',
    'failureTransporterRPCGetGlyphSummary'

]);

module.exports = TransporterRPCActions;
