'use strict';

var dao                         = require('js/dao');

var SpacePortRPCActions          = require('js/actions/rpc/spacePort');
var BuildingWindowActions       = require('js/actions/windows/building');

function makeSpacePortCall(options) {
    dao.makeServerCall('spaceport', options, SpacePortRPCActions);
}

SpacePortRPCActions.requestSpacePortRPCView.listen(function(o) {
    makeSpacePortCall({
        method  : 'view',
        params  : [o],
        success : 'successSpacePortRPCView',
        error   : 'failureSpacePortRPCView' 
    });
});

SpacePortRPCActions.successSpacePortRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});

SpacePortRPCActions.requestSpacePortRPCViewAllFleets.listen(function(building_id) {
    makeSpacePortCall({
        method  : 'view_all_fleets',
        params  : { building_id : building_id },
        success : 'successSpacePortRPCViewAllFleets',
        error   : 'failureSpacePortRPCViewAllFleets' 
    });
});

SpacePortRPCActions.requestSpacePortRPCViewIncomingFleets.listen(function(o) {
    makeSpacePortCall({
        method  : 'view_incoming_fleets',
        params  : [o],
        success : 'successSpacePortRPCViewIncomingFleets',
        error   : 'failureSpacePortRPCViewIncomingFleets' 
    });
});

SpacePortRPCActions.requestSpacePortRPCViewAvailableFleets.listen(function(o) {
    makeSpacePortCall({
        method  : 'view_available_fleets',
        params  : [o],
        success : 'successSpacePortRPCViewAvailableFleets',
        error   : 'failureSpacePortRPCViewAvailableFleets' 
    });
});

SpacePortRPCActions.requestSpacePortRPCViewUnavailableFleets.listen(function(o) {
    makeSpacePortCall({
        method  : 'view_unavailable_fleets',
        params  : [o],
        success : 'successSpacePortRPCViewUnavailableFleets',
        error   : 'failureSpacePortRPCViewUnavailableFleets' 
    });
});

SpacePortRPCActions.requestSpacePortRPCViewOrbitingFleets.listen(function(o) {
    makeSpacePortCall({
        method  : 'view_orbiting_fleets',
        params  : [o],
        success : 'successSpacePortRPCViewOrbitingFleets',
        error   : 'failureSpacePortRPCViewOrbitingFleets' 
    });
});

SpacePortRPCActions.requestSpacePortRPCViewMiningPlatforms.listen(function(o) {
    makeSpacePortCall({
        method  : 'view_mining_platforms',
        params  : [o],
        success : 'successSpacePortRPCViewMiningPlatforms',
        error   : 'failureSpacePortRPCViewMiningPlatforms' 
    });
});

SpacePortRPCActions.requestSpacePortRPCViewExcavators.listen(function(o) {
    makeSpacePortCall({
        method  : 'view_excavators',
        params  : [o],
        success : 'successSpacePortRPCViewExcavators',
        error   : 'failureSpacePortRPCViewExcavators' 
    });
});

SpacePortRPCActions.requestSpacePortRPCSendFleet.listen(function(o) {
    makeSpacePortCall({
        method  : 'send_fleet',
        params  : [o],
        success : 'successSpacePortRPCSendFleet',
        error   : 'failureSpacePortRPCSendFleet' 
    });
});

SpacePortRPCActions.requestSpacePortRPCRecallFleet.listen(function(o) {
    makeSpacePortCall({
        method  : 'recall_fleet',
        params  : [o],
        success : 'successSpacePortRPCRecallFleet',
        error   : 'failureSpacePortRPCRecallFleet' 
    });
});

SpacePortRPCActions.requestSpacePortRPCRenameFleet.listen(function(o) {
    makeSpacePortCall({
        method  : 'rename_fleet',
        params  : [o],
        success : 'successSpacePortRPCRenameFleet',
        error   : 'failureSpacePortRPCRenameFleet' 
    });
});

SpacePortRPCActions.requestSpacePortRPCScuttleFleet.listen(function(o) {
    makeSpacePortCall({
        method  : 'scuttle_fleet',
        params  : [o],
        success : 'successSpacePortRPCScuttleFleet',
        error   : 'failureSpacePortRPCScuttleFleet' 
    });
});

SpacePortRPCActions.requestSpacePortRPCViewTravellingFleets.listen(function(o) {
    makeSpacePortCall({
        method  : 'view_travelling_fleets',
        params  : [o],
        success : 'successSpacePortRPCViewTravellingFleets',
        error   : 'failureSpacePortRPCViewTravellingFleets' 
    });
});

SpacePortRPCActions.requestSpacePortRPCPrepareSendSpies.listen(function(o) {
    makeSpacePortCall({
        method  : 'prepare_send_spies',
        params  : [o],
        success : 'successSpacePortRPCPrepareSendSpies',
        error   : 'failureSpacePortRPCPrepareSendSpies' 
    });
});

SpacePortRPCActions.requestSpacePortRPCSendSpies.listen(function(o) {
    makeSpacePortCall({
        method  : 'send_spies',
        params  : [o],
        success : 'successSpacePortRPCSendSpies',
        error   : 'failureSpacePortRPCSendSpies' 
    });
});

SpacePortRPCActions.requestSpacePortRPCPrepareFetchSpies.listen(function(o) {
    makeSpacePortCall({
        method  : 'prepare_fetch_spies',
        params  : [o],
        success : 'successSpacePortRPCPrepareFetchSpies',
        error   : 'failureSpacePortRPCPrepareFetchSpies' 
    });
});

SpacePortRPCActions.requestSpacePortRPCFetchSpies.listen(function(o) {
    makeSpacePortCall({
        method  : 'fetch_spies',
        params  : [o],
        success : 'successSpacePortRPCFetchSpies',
        error   : 'failureSpacePortRPCFetchSpies' 
    });
});

SpacePortRPCActions.requestSpacePortRPCViewBattleLog.listen(function(o) {
    makeSpacePortCall({
        method  : 'view_battle_log',
        params  : [o],
        success : 'successSpacePortRPCViewBattleLog',
        error   : 'failureSpacePortRPCViewBattleLog' 
    });
});


