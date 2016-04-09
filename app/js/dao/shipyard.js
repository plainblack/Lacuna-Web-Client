'use strict';

var dao                         = require('js/dao');

var ShipyardRPCActions          = require('js/actions/rpc/shipyard');
var BuildingWindowActions       = require('js/actions/windows/building');

function makeShipyardCall(options) {
    dao.makeServerCall('shipyard', options, ShipyardRPCActions);
}

ShipyardRPCActions.requestShipyardRPCView.listen(function(o) {
    makeShipyardCall({
        method  : 'view',
        params  : [o],
        success : 'successShipyardRPCView',
        error   : 'failureShipyardRPCView' 
    });
});

ShipyardRPCActions.successShipyardRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});

ShipyardRPCActions.requestShipyardRPCGetBuildable.listen(function(o) {
    makeShipyardCall({
        method  : 'get_buildable',
        params  : [o],
        success : 'successShipyardRPCGetBuildable',
        error   : 'failureShipyardRPCGetBuildable' 
    });
});

ShipyardRPCActions.requestShipyardRPCGetRepairable.listen(function(o) {
    makeShipyardCall({
        method  : 'get_repairable',
        params  : [o],
        success : 'successShipyardRPCGetRepairable',
        error   : 'failureShipyardRPCGetRepairable' 
    });
});

ShipyardRPCActions.requestShipyardRPCBuildFleet.listen(function(o) {
    makeShipyardCall({
        method  : 'build_fleet',
        params  : o,
        success : 'successShipyardRPCBuildFleet',
        error   : 'failureShipyardRPCBuildFleet' 
    });
});

ShipyardRPCActions.requestShipyardRPCRepairFleet.listen(function(o) {
    makeShipyardCall({
        method  : 'repair_fleet',
        params  : [o],
        success : 'successShipyardRPCRepairFleet',
        error   : 'failureShipyardRPCRepairFleet' 
    });
});

ShipyardRPCActions.requestShipyardRPCViewBuildQueue.listen(function(o) {
    makeShipyardCall({
        method  : 'view_build_queue',
        params  : o,
        success : 'successShipyardRPCViewBuildQueue',
        error   : 'failureShipyardRPCViewBuildQueue' 
    });
});

ShipyardRPCActions.requestShipyardRPCSubsidizeBuildQueue.listen(function(o) {
    makeShipyardCall({
        method  : 'subsidize_build_queue',
        params  : [o],
        success : 'successShipyardRPCSubsidizeBuildQueue',
        error   : 'failureShipyardRPCSubsidizeBuildQueue' 
    });
});

ShipyardRPCActions.requestShipyardRPCSubsidizeFleet.listen(function(o) {
    makeShipyardCall({
        method  : 'subsidize_fleet',
        params  : [o],
        success : 'successShipyardRPCSubsidizeFleet',
        error   : 'failureShipyardRPCSubsidizeFleet' 
    });
});


