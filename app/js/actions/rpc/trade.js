'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var TradeRPCActions = Reflux.createActions([
    'requestTradeRPCView',
    'successTradeRPCView',
    'failureTradeRPCView',

    'requestTradeRPCGetSupplyFleets',
    'successTradeRPCGetSupplyFleets',
    'failureTradeRPCGetSupplyFleets',

    'requestTradeRPCViewSupplyChains',
    'successTradeRPCViewSupplyChains',
    'failureTradeRPCViewSupplyChains',

    'requestTradeRPCAddSupplyFleet',
    'successTradeRPCAddSupplyFleet',
    'failureTradeRPCAddSupplyFleet',

    'requestTradeRPCRemoveSupplyFleet',
    'successTradeRPCRemoveSupplyFleet',
    'failureTradeRPCRemoveSupplyFleet',

    'requestTradeRPCCreateSupplyChain',
    'successTradeRPCCreateSupplyChain',
    'failureTradeRPCCreateSupplyChain',

    'requestTradeRPCDeleteSupplyChain',
    'successTradeRPCDeleteSupplyChain',
    'failureTradeRPCDeleteSupplyChain',

    'requestTradeRPCUpdateSupplyChain',
    'successTradeRPCUpdateSupplyChain',
    'failureTradeRPCUpdateSupplyChain',

    'requestTradeRPCGetWasteFleets',
    'successTradeRPCGetWasteFleets',
    'failureTradeRPCGetWasteFleets',

    'requestTradeRPCViewWasteChains',
    'successTradeRPCViewWasteChains',
    'failureTradeRPCViewWasteChains',

    'requestTradeRPCAddWasteFleet',
    'successTradeRPCAddWasteFleet',
    'failureTradeRPCAddWasteFleet',

    'requestTradeRPCRemoveWasteFleet',
    'successTradeRPCRemoveWasteFleet',
    'failureTradeRPCRemoveWasteFleet',

    'requestTradeRPCUpdateWasteChain',
    'successTradeRPCUpdateWasteChain',
    'failureTradeRPCUpdateWasteChain',

    'requestTradeRPCReportAbuse',
    'successTradeRPCReportAbuse',
    'failureTradeRPCReportAbuse',

    'requestTradeRPCViewMyMarket',
    'successTradeRPCViewMyMarket',
    'failureTradeRPCViewMyMarket',

    'requestTradeRPCViewMarket',
    'successTradeRPCViewMarket',
    'failureTradeRPCViewMarket',

    'requestTradeRPCAcceptFromMarket',
    'successTradeRPCAcceptFromMarket',
    'failureTradeRPCAcceptFromMarket',

    'requestTradeRPCWithdrawFromMarket',
    'successTradeRPCWithdrawFromMarket',
    'failureTradeRPCWithdrawFromMarket',

    'requestTradeRPCAddToMarket',
    'successTradeRPCAddToMarket',
    'failureTradeRPCAddToMarket',

    'requestTradeRPCPushItems',
    'successTradeRPCPushItems',
    'failureTradeRPCPushItems',

    'requestTradeRPCGetTradeFleets',
    'successTradeRPCGetTradeFleets',
    'failureTradeRPCGetTradeFleets',

    'requestTradeRPCGetStoredResources',
    'successTradeRPCGetStoredResources',
    'failureTradeRPCGetStoredResources',

    'requestTradeRPCGetFleets',
    'successTradeRPCGetFleets',
    'failureTradeRPCGetFleets',

    'requestTradeRPCGetFleetSummary',
    'successTradeRPCGetFleetSummary',
    'failureTradeRPCGetFleetSummary',

    'requestTradeRPCGetPrisoners',
    'successTradeRPCGetPrisoners',
    'failureTradeRPCGetPrisoners',

    'requestTradeRPCGetPlanSummary',
    'successTradeRPCGetPlanSummary',
    'failureTradeRPCGetPlanSummary',

    'requestTradeRPCGetGlyphSummary',
    'successTradeRPCGetGlyphSummary',
    'failureTradeRPCGetGlyphSummary'
]);

module.exports = TradeRPCActions;
