'use strict';

var dao                     = require('js/dao');

var BuildingWindowActions   = require('js/actions/window/building');

function makeGenericBuildingCall(url, options) {
    dao.makeServerCall(url.replace(/^\//, ''), options, IntelTrainingRPCActions);
}

BuildingWindowActions.buildingWindowView.listen(function(url, id) {
    makeGenericBuildingCall(url, {
        method  : 'view',
        params  : [id],
        success : 'successBuildingWindowView'
        error   : 'failureBuildingWindowView'
    });
});

BuildingWindowActions.buildingWindowUpgrade.listen(function(url, id) {
    makeGenericBuildingCall(url, {
        method  : 'upgrade',
        params  : [id],
        success : 'successBuildingWindowUpgrade'
        error   : 'failureBuildingWindowUpgrade'
    });
});

BuildingWindowActions.buildingWindowRepair.listen(function(url, id) {
    makeGenericBuildingCall(url, {
        method  : 'repair',
        params  : [id],
        success : 'successBuildingWindowRepair'
        error   : 'failureBuildingWindowRepair'
    });
});

BuildingWindowActions.buildingWindowDowngrade.listen(function(url, id) {
    makeGenericBuildingCall(url, {
        method  : 'downgrade',
        params  : [id],
        success : 'successBuildingWindowDowngrade'
        error   : 'failureBuildingWindowDowngrade'
    });
});

BuildingWindowActions.buildingWindowDemolish.listen(function(url, id) {
    makeGenericBuildingCall(url, {
        method  : 'demolish',
        params  : [id],
        success : 'successBuildingWindowDemolish'
        error   : 'failureBuildingWindowDemolish'
    });
});


