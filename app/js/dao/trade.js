'use strict';

var dao                         = require('js/dao');

var TradeRPCActions             = require('js/actions/rpc/trade');
var BuildingWindowActions       = require('js/actions/windows/building');

function makeTradeCall(options) {
    dao.makeServerCall('trade', options, TradeRPCActions);
}

TradeRPCActions.requestTradeRPCView.listen(function(o) {
    makeTradeCall({
        method  : 'view',
        params  : [o],
        success : 'successTradeRPCView',
        error   : 'failureTradeRPCView'
    });
});

TradeRPCActions.successTradeRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});

TradeRPCActions.requestTradeRPCGetSupplyFleets.listen(function(o) {
    makeTradeCall({
        method  : 'get_supply_fleets',
        params  : [o],
        success : 'successTradeRPCGetSupplyFleets',
        error   : 'failureTradeRPCGetSupplyFleets'
    });
});

TradeRPCActions.requestTradeRPCViewSupplyChains.listen(function(o) {
    makeTradeCall({
        method  : 'view_supply_chains',
        params  : [o],
        success : 'successTradeRPCViewSupplyChains',
        error   : 'failureTradeRPCViewSupplyChains'
    });
});

TradeRPCActions.requestTradeRPCAddSupplyFleet.listen(function(o) {
    makeTradeCall({
        method  : 'add_supply_fleet',
        params  : [o],
        success : 'successTradeRPCAddSupplyFleet',
        error   : 'failureTradeRPAddSupplyFleetC'
    });
});

TradeRPCActions.requestTradeRPCRemoveSupplyFleet.listen(function(o) {
    makeTradeCall({
        method  : 'remove_supply_fleet',
        params  : [o],
        success : 'successTradeRPCRemoveSupplyFleet',
        error   : 'failureTradeRPRemoveSupplyFleetC'
    });
});

TradeRPCActions.requestTradeRPCCreateSupplyChain.listen(function(o) {
    makeTradeCall({
        method  : 'create_supply_chain',
        params  : [o],
        success : 'successTradeRPCCreateSupplyChain',
        error   : 'failureTradeRPCreateSupplyChainC'
    });
});

TradeRPCActions.requestTradeRPCDeleteSupplyChain.listen(function(o) {
    makeTradeCall({
        method  : 'delete_supply_chain',
        params  : [o],
        success : 'successTradeRPCDeleteSupplyChain',
        error   : 'failureTradeRPCDeleteSupplyChain'
    });
});

TradeRPCActions.requestTradeRPCUpdateSupplyChain.listen(function(o) {
    makeTradeCall({
        method  : 'update_supply_chain',
        params  : [o],
        success : 'successTradeRPCUpdateSupplyChain',
        error   : 'failureTradeRPCUpdateSupplyChain'
    });
});

TradeRPCActions.requestTradeRPCGetWasteFleets.listen(function(o) {
    makeTradeCall({
        method  : 'get_waste_fleets',
        params  : [o],
        success : 'successTradeRPCGetWasteFleets',
        error   : 'failureTradeRPCGetWasteFleets'
    });
});

TradeRPCActions.requestTradeRPCViewWasteChains.listen(function(o) {
    makeTradeCall({
        method  : 'view_waste_chains',
        params  : [o],
        success : 'successTradeRPCViewWasteChains',
        error   : 'failureTradeRPCViewWasteChains'
    });
});

TradeRPCActions.requestTradeRPCAddWasteFleet.listen(function(o) {
    makeTradeCall({
        method  : 'add_waste_fleet',
        params  : [o],
        success : 'successTradeRPCAddWasteFleet',
        error   : 'failureTradeRPCAddWasteFleet'
    });
});

TradeRPCActions.requestTradeRPCRemoveWasteFleet.listen(function(o) {
    makeTradeCall({
        method  : 'remove_waste_fleet',
        params  : [o],
        success : 'successTradeRPCRemoveWasteFleet',
        error   : 'failureTradeRPCRemoveWasteFleet'
    });
});

TradeRPCActions.requestTradeRPCUpdateWasteChain.listen(function(o) {
    makeTradeCall({
        method  : 'update_waste_chain',
        params  : [o],
        success : 'successTradeRPCUpdateWasteChain',
        error   : 'failureTradeRPCUpdateWasteChain'
    });
});

TradeRPCActions.requestTradeRPCReportAbuse.listen(function(o) {
    makeTradeCall({
        method  : 'report_abuse',
        params  : [o],
        success : 'successTradeRPCReportAbuse',
        error   : 'failureTradeRPCReportAbuse'
    });
});

TradeRPCActions.requestTradeRPCViewMyMarket.listen(function(o) {
    makeTradeCall({
        method  : 'view_my_market',
        params  : [o],
        success : 'successTradeRPCViewMyMarket',
        error   : 'failureTradeRPCViewMyMarket'
    });
});

TradeRPCActions.requestTradeRPCViewMarket.listen(function(o) {
    makeTradeCall({
        method  : 'view_market',
        params  : [o],
        success : 'successTradeRPCViewMarket',
        error   : 'failureTradeRPCViewMarket'
    });
});

TradeRPCActions.requestTradeRPCAcceptFromMarket.listen(function(o) {
    makeTradeCall({
        method  : 'accept_from_market',
        params  : [o],
        success : 'successTradeRPCAcceptFromMarket',
        error   : 'failureTradeRPCAcceptFromMarket'
    });
});

TradeRPCActions.requestTradeRPCWithdrawFromMarket.listen(function(o) {
    makeTradeCall({
        method  : 'withdraw_from_market',
        params  : [o],
        success : 'successTradeRPCWithdrawFromMarket',
        error   : 'failureTradeRPCWithdrawFromMarket'
    });
});

TradeRPCActions.requestTradeRPCAddToMarket.listen(function(o) {
    makeTradeCall({
        method  : 'add_to_market',
        params  : [o],
        success : 'successTradeRPCAddToMarket',
        error   : 'failureTradeRPCAddToMarket'
    });
});

TradeRPCActions.requestTradeRPCPushItems.listen(function(o) {
    makeTradeCall({
        method  : 'push_items',
        params  : [o],
        success : 'successTradeRPCPushItems',
        error   : 'failureTradeRPCPushItems'
    });
});

TradeRPCActions.requestTradeRPCGetTradeFleets.listen(function(o) {
    makeTradeCall({
        method  : 'get_trade_fleets',
        params  : [o],
        success : 'successTradeRPCGetTradeFleets',
        error   : 'failureTradeRPCGetTradeFleets'
    });
});

TradeRPCActions.requestTradeRPCGetStoredResources.listen(function(o) {
    makeTradeCall({
        method  : 'get_stored_resources',
        params  : [o],
        success : 'successTradeRPCGetStoredResources',
        error   : 'failureTradeRPCGetStoredResources'
    });
});

TradeRPCActions.requestTradeRPCGetFleets.listen(function(o) {
    makeTradeCall({
        method  : 'get_fleets',
        params  : [o],
        success : 'successTradeRPCGetFleets',
        error   : 'failureTradeRPCGetFleets'
    });
});

TradeRPCActions.requestTradeRPCGetFleetSummary.listen(function(o) {
    makeTradeCall({
        method  : 'get_fleet_summary',
        params  : [o],
        success : 'successTradeRPCGetFleetSummary',
        error   : 'failureTradeRPCGetFleetSummary'
    });
});

TradeRPCActions.requestTradeRPCGetPrisoners.listen(function(o) {
    makeTradeCall({
        method  : 'get_prisoners',
        params  : [o],
        success : 'successTradeRPCGetPrisoners',
        error   : 'failureTradeRPCGetPrisoners'
    });
});

TradeRPCActions.requestTradeRPCGetPlanSummary.listen(function(o) {
    makeTradeCall({
        method  : 'get_plan_summary',
        params  : [o],
        success : 'successTradeRPCGetPlanSummary',
        error   : 'failureTradeRPCGetPlanSummary'
    });
});

TradeRPCActions.requestTradeRPCGetGlyphSummary.listen(function(o) {
    makeTradeCall({
        method  : 'get_glyph_summary',
        params  : [o],
        success : 'successTradeRPCGetGlyphSummary',
        error   : 'failureTradeRPCGetGlyphSummary'
    });
});


