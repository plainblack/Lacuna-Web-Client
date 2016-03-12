'use strict';

var Reflux          = require('reflux');
var Server          = require('js/server');
var _               = require('lodash');

var StatsRPCActions = require('js/actions/rpc/stats');

function makeStatsCall(options) {
    var defaults = {
        module  : 'stats',
        params  : {},
        success : 'noop',
        error   : 'noop'
    };
    options = _.merge({}, defaults, options || {});

    Server.call({
        module  : options.module,
        method  : options.method,
        params  : options.params,
        success : function(result) {
            console.log('makeStatsCall: ' + options.method + '_success');
            StatsRPCActions[options.success](result);
        },
        error : function(error) {
            console.log('makeStatsCall: ' + options.method + '_error');
            options.error(error);
            StatsRPCActions[options.error](error);
        }
    });
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
