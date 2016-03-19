'use strict';

var Reflux          = require('reflux');
var Server          = require('js/server');
var _               = require('lodash');

var IntelTrainingRPCActions  = require('js/actions/rpc/intelTraining');
var BuildingWindowActions   = require('js/actions/windows/building');

function makeServerCall(uri, options, actions) {
    var defaults = {
        module  : uri,
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
            console.log('makeServerCall: SUCCESS ' + uri + ' - ' + options.method + '_success');
            actions[options.success](result);
        },
        error : function(error) {
            console.log('makeServerCall: FAILURE ' + uri + ' - ' + options.method + '_success');
            options.error(error);
            actions[options.error](error);
        }
    });
}

function makeIntelTrainingCall(options) {
    makeServerCall('inteltraining', options, IntelTrainingRPCActions);
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

