'use strict';

var Reflux          = require('reflux');
var Server          = require('js/server');
var _               = require('lodash');

var EssentiaVeinRPCActions  = require('js/actions/rpc/essentiaVein');
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

function makeEssentiaVeinCall(options) {
    makeServerCall('essentiavein', options, EssentiaVeinRPCActions);
}

EssentiaVeinRPCActions.requestEssentiaVeinRPCView.listen(function(o) {
    makeEssentiaVeinCall({
        method  : 'view',
        params  : [o],
        success : 'successEssentiaVeinRPCView',
        error   : 'failureEssentiaVeinRPCView' 
    });
});
EssentiaVeinRPCActions.successEssentiaVeinRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result.building);
});


EssentiaVeinRPCActions.requestEssentiaVeinRPCDrain.listen(function(o) {
    makeEssentiaVeinCall({
        method  : 'drain',
        params  : [],
        success : 'successEssentiaVeinRPCDrain',
        error   : 'failureEssentiaVeinRPCDrain' 
    });
});


