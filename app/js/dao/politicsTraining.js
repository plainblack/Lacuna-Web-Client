'use strict';

var dao                         = require('js/dao');

var PoliticsTrainingRPCActions  = require('js/actions/rpc/politicsTraining');
var BuildingWindowActions       = require('js/actions/windows/building');

function makePoliticsTrainingCall(options) {
    dao.makeServerCall('politicstraining', options, PoliticsTrainingRPCActions);
}

PoliticsTrainingRPCActions.requestPoliticsTrainingRPCView.listen(function(o) {
    makePoliticsTrainingCall({
        method  : 'view',
        params  : [o],
        success : 'successPoliticsTrainingRPCView',
        error   : 'failurePoliticsTrainingRPCView' 
    });
});
PoliticsTrainingRPCActions.successPoliticsTrainingRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});

