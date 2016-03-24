'use strict';

var dao                         = require('js/dao');

var GenericBuildingRPCActions   = require('js/actions/rpc/genericBuilding');
var BuildingWindowActions       = require('js/actions/windows/building');

function makeGenericBuildingCall(url, options) {
    dao.makeServerCall(url, options, GenericBuildingRPCActions);
}

GenericBuildingRPCActions.requestGenericBuildingRPCView.listen(function(url, o) {
    url = url.replace(/^\//, '');
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

