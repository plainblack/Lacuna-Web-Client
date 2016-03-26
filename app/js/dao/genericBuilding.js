'use strict';

var dao                         = require('js/dao');

var GenericBuildingRPCActions   = require('js/actions/rpc/genericBuilding');
var BuildingWindowActions       = require('js/actions/windows/building');

function makeGenericBuildingCall(url, options) {
    url = url.replace(/^\//, '');
    dao.makeServerCall(url, options, GenericBuildingRPCActions);
}

GenericBuildingRPCActions.requestGenericBuildingRPCView.listen(function(url, o) {
    makeGenericBuildingCall(url, {
        method  : 'view',
        params  : [o],
        success : 'successGenericBuildingRPCView',
        error   : 'failureGenericBuildingRPCView' 
    });
});

GenericBuildingRPCActions.successGenericBuildingRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});

GenericBuildingRPCActions.requestGenericBuildingRPCUpgrade.listen(function(url, o) {
    makeGenericBuildingCall(url, {
        method  : 'upgrade',
        params  : [o],
        success : 'successGenericBuildingRPCUpgrade',
        error   : 'failureGenericBuildingRPCUpgrade' 
    });
});

GenericBuildingRPCActions.successGenericBuildingRPCUpgrade.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});

GenericBuildingRPCActions.requestGenericBuildingRPCDowngrade.listen(function(url, o) {
    makeGenericBuildingCall(url, {
        method  : 'downgrade',
        params  : [o],
        success : 'successGenericBuildingRPCDowngrade',
        error   : 'failureGenericBuildingRPCDowngrade' 
    });
});

GenericBuildingRPCActions.successGenericBuildingRPCDowngrade.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});

GenericBuildingRPCActions.requestGenericBuildingRPCDemolish.listen(function(url, o) {
    makeGenericBuildingCall(url, {
        method  : 'demolish',
        params  : [o],
        success : 'successGenericBuildingRPCDemolish',
        error   : 'failureGenericBuildingRPCDemolish' 
    });
});

GenericBuildingRPCActions.requestGenericBuildingRPCRepair.listen(function(url, o) {
    makeGenericBuildingCall(url, {
        method  : 'repair',
        params  : [o],
        success : 'successGenericBuildingRPCRepair',
        error   : 'failureGenericBuildingRPCRepair' 
    });
});

GenericBuildingRPCActions.successGenericBuildingRPCRepair.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});


