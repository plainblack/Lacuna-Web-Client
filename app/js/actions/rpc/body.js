'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var RpcBodyActions = Reflux.createActions([
    'rpcBodyGetStatus',

    'rpcBodyRepairList',
    'rpcBodyRearrangeBuildings',
    'rpcBodyGetBuildable',
    'rpcBodyGetBuildableLocations',
    'rpcBodyRename',
    'rpcBodyAbandon',
    'rpcBodyViewLaws',

    'rpcBodyGetBuildings',
    'bodyGetBuildings_success',
    'bodyGetBuildings_error',

    'rpcBodySetColonyNotes',
    'bodySetColonyNotes_success',
    'bodySetColonyNotes_error'

]);

function rpcBodyCall(options) {
    var defaults = {
        module:     'body',
        params:     [],
        success:    'noop',
        error:      'noop'
    };
    options = _.merge({}, defaults, options || {});

    Server.call({
        module:     options.module,
        method:     options.method,
        params:     options.params,
        success:    function(result) {
            console.log("RpcBodyActions: "+options.method+"_success");
            // TODO save the status in a common store
            if (typeof result.status != "undefined") {
                var status = _.cloneDeep(result.status);
            }

            // Don't encumber the stores with multiple copies of the status
            delete result.status;
            RpcBodyActions[options.success](result);
        },
        error:      function(error) {
            console.log("RpcBodyActions: "+options.method+"_error");
            RpcBodyActions[options.error](error);
        }
    });
}


RpcBodyActions.rpcBodyGetBuildings.listen(function(o) {
    rpcBodyCall({
        method:     'get_buildings',
        params:     [ o.bodyId ],
        success:    'bodyGetBuildings_success',
        error:      'bodyGetBuildings_error'
    });
});

RpcBodyActions.rpcBodySetColonyNotes.listen(function(o) {
    rpcBodyCall({
        method:     'set_colony_notes',
        params:     [ o.bodyId, { notes: o.notes } ],
        success:    'bodySetColonyNotes_success',
        error:      'bodySetColonyNotes_error'
    });
});

module.exports = RpcBodyActions;
