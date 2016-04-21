'use strict';

var dao                         = require('js/dao');

var TransporterRPCActions       = require('js/actions/rpc/transporter');
var BuildingWindowActions       = require('js/actions/windows/building');

function makeTransporterCall(options) {
    dao.makeServerCall('transporter', options, TransporterRPCActions);
}

TransporterRPCActions.requestTransporterRPCView.listen(function(o) {
    makeTransporterCall({
        method  : 'view',
        params  : [o],
        success : 'successTransporterRPCView',
        error   : 'failureTransporterRPCView'
    });
});

TransporterRPCActions.successTransporterRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});

TransporterRPCActions.requestTransporterRPCReportAbuse.listen(function(o) {
    makeTransporterCall({
        method  : 'report_abuse',
        params  : [o],
        success : 'successTransporterRPCReportAbuse',
        error   : 'failureTransporterRPCReportAbuse'
    });
});

TransporterRPCActions.requestTransporterRPCViewMyMarket.listen(function(o) {
    makeTransporterCall({
        method  : 'view_my_market',
        params  : [o],
        success : 'successTransporterRPCViewMyMarket',
        error   : 'failureTransporterRPCViewMyMarket'
    });
});

TransporterRPCActions.requestTransporterRPCViewMarket.listen(function(o) {
    makeTransporterCall({
        method  : 'view_market',
        params  : [o],
        success : 'successTransporterRPCViewMarket',
        error   : 'failureTransporterRPCViewMarket'
    });
});

TransporterRPCActions.requestTransporterRPCAcceptFromMarket.listen(function(o) {
    makeTransporterCall({
        method  : 'accept_from_market',
        params  : [o],
        success : 'successTransporterRPCAcceptFromMarket',
        error   : 'failureTransporterRPCAcceptFromMarket'
    });
});

TransporterRPCActions.requestTransporterRPCWithdrawFromMarket.listen(function(o) {
    makeTransporterCall({
        method  : 'withdraw_from_market',
        params  : [o],
        success : 'successTransporterRPCWithdrawFromMarket',
        error   : 'failureTransporterRPCWithdrawFromMarket'
    });
});

TransporterRPCActions.requestTransporterRPCAddToMarket.listen(function(o) {
    makeTransporterCall({
        method  : 'add_to_market',
        params  : [o],
        success : 'successTransporterRPCAddToMarket',
        error   : 'failureTransporterRPCAddToMarket'
    });
});

TransporterRPCActions.requestTransporterRPCPushItems.listen(function(o) {
    makeTransporterCall({
        method  : 'push_items',
        params  : [o],
        success : 'successTransporterRPCPushItems',
        error   : 'failureTransporterRPCPushItems'
    });
});

TransporterRPCActions.requestTransporterRPCTradeOneForOne.listen(function(o) {
    makeTransporterCall({
        method  : 'trade_one_for_one',
        params  : [o],
        success : 'successTransporterRPCTradeOneForOne',
        error   : 'failureTransporterRPCTradeOneForOne'
    });
});

TransporterRPCActions.requestTransporterRPCGetStoredResources.listen(function(o) {
    makeTransporterCall({
        method  : 'get_stored_procedures',
        params  : [o],
        success : 'successTransporterRPCGetStoredResources',
        error   : 'failureTransporterRPCGetStoredResources'
    });
});

TransporterRPCActions.requestTransporterRPCGetFleets.listen(function(o) {
    makeTransporterCall({
        method  : 'get_fleets',
        params  : [o],
        success : 'successTransporterRPCGetFleets',
        error   : 'failureTransporterRPCGetFleets'
    });
});

TransporterRPCActions.requestTransporterRPCGetFleetSummary.listen(function(o) {
    makeTransporterCall({
        method  : 'get_fleet_summary',
        params  : [o],
        success : 'successTransporterRPCGetFleetSummary',
        error   : 'failureTransporterRPCGetFleetSummary'
    });
});

TransporterRPCActions.requestTransporterRPCGetPrisoners.listen(function(o) {
    makeTransporterCall({
        method  : 'get_prisoners',
        params  : [o],
        success : 'successTransporterRPCGetPrisoners',
        error   : 'failureTransporterRPCGetPrisoners'
    });
});

TransporterRPCActions.requestTransporterRPCGetPlanSummary.listen(function(o) {
    makeTransporterCall({
        method  : 'get_plan_summary',
        params  : [o],
        success : 'successTransporterRPCGetPlanSummary',
        error   : 'failureTransporterRPCGetPlanSummary'
    });
});

TransporterRPCActions.requestTransporterRPCGetGlyphSummary.listen(function(o) {
    makeTransporterCall({
        method  : 'get_glyph_summary',
        params  : [o],
        success : 'successTransporterRPCGetGlyphSummary',
        error   : 'failureTransporterRPCGetGlyphSummary'
    });
});


