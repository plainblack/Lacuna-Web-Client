'use strict';

var dao                         = require('js/dao');

var MayhemTrainingRPCActions    = require('js/actions/rpc/mayhemTraining');
var BuildingWindowActions       = require('js/actions/windows/building');

function makeMayhemTrainingCall(options) {
    dao.makeServerCall('mayhemtraining', options, MayhemTrainingRPCActions);
}

MayhemTrainingRPCActions.requestMayhemTrainingRPCView.listen(function(o) {
    makeMayhemTrainingCall({
        method  : 'view',
        params  : [o],
        success : 'successMayhemTrainingRPCView',
        error   : 'failureMayhemTrainingRPCView' 
    });
});
MayhemTrainingRPCActions.successMayhemTrainingRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});

