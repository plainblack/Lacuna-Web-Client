'use strict';

var Reflux          = require('reflux');
var Server          = require('js/server');
var _               = require('lodash');

var RpcStatsActions = require('js/actions/rpc/stats');

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
            RpcStatsActions[options.success](result);
        },
        error : function(error) {
            console.log('makeStatsCall: ' + options.method + '_error');
            options.error(error);
            RpcStatsActions[options.error](error);
        }
    });
}

RpcStatsActions.requestStatsGetCredits.listen(function(o) {
    makeStatsCall({
        method  : 'credits',
        params  : [],
        success : 'successStatsGetCredits',
        error   : 'failureStatsGetCredits' 
    });
});

module.exports = RpcStatsActions;
