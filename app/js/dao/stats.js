'use strict';

var dao             = require('js/dao');

var StatsRPCActions = require('js/actions/rpc/stats');

function makeIntelTrainingCall(options) {
    dao.makeServerCall('stats', options, StatsRPCActions);
}

StatsRPCActions.requestStatsRPCGetCredits.listen(function(o) {
    makeStatsCall({
        method  : 'credits',
        params  : [],
        success : 'successStatsRPCGetCredits',
        error   : 'failureStatsRPCGetCredits' 
    });
});

module.exports = StatsRPCActions;
