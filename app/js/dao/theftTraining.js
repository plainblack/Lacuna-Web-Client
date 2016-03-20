'use strict';

var Reflux          = require('reflux');
var Server          = require('js/server');
var _               = require('lodash');

var TheftTrainingRPCActions  = require('js/actions/rpc/theftTraining');
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

function makeTheftTrainingCall(options) {
    makeServerCall('thefttraining', options, TheftTrainingRPCActions);
}

TheftTrainingRPCActions.requestTheftTrainingRPCView.listen(function(o) {
    makeTheftTrainingCall({
        method  : 'view',
        params  : [o],
        success : 'successTheftTrainingRPCView',
        error   : 'failureTheftTrainingRPCView' 
    });
});
TheftTrainingRPCActions.successTheftTrainingRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});

