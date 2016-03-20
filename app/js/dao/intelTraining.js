'use strict';

var dao                     = require('js/dao');

var IntelTrainingRPCActions = require('js/actions/rpc/intelTraining');
var BuildingWindowActions   = require('js/actions/windows/building');

function makeIntelTrainingCall(options) {
    dao.makeServerCall('inteltraining', options, IntelTrainingRPCActions);
}

IntelTrainingRPCActions.requestIntelTrainingRPCView.listen(function(o) {
    makeIntelTrainingCall({
        method  : 'view',
        params  : [o],
        success : 'successIntelTrainingRPCView',
        error   : 'failureIntelTrainingRPCView' 
    });
});
IntelTrainingRPCActions.successIntelTrainingRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});

