'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var BodyRPCActions = Reflux.createActions([
    'requestBodyRPCGetStatus',

    'requestBodyRPCRepairList',
    'requestBodyRPCRearrangeBuildings',
    'requestBodyRPCGetBuildable',
    'requestBodyRPCGetBuildableLocations',
    'requestBodyRPCRename',
    'requestBodyRPCAbandon',
    'requestBodyRPCViewLaws',

    'requestBodyRPCGetBuildings',
    'successBodyRPCGetBuildings',
    'failureBodyRPCGetBuildings',

    'requestBodyRPCSetColonyNotes',
    'successBodyRPCSetColonyNotes',
    'failureBodyRPCSetColonyNotes'

]);

function requestBodyCall(options) {
    var defaults = {
        module  : 'body',
        params  : [],
        success : 'noop',
        error   : 'noop'
    };
    options = _.merge({}, defaults, options || {});

    Server.call({
        module  : options.module,
        method  : options.method,
        params  : options.params,
        success : function(result) {
            console.log('BodyRPCActions: ' + options.method + '_success');
            // TODO save the status in a common store
            if (typeof result.status !== 'undefined') {
                // var status = _.cloneDeep(result.status);
            }

            // Don't encumber the stores with multiple copies of the status
            delete result.status;
            BodyRPCActions[options.success](result);
        },
        error : function(error) {
            console.log('BodyRPCActions: ' + options.method + '_error');
            BodyRPCActions[options.error](error);
        }
    });
}

BodyRPCActions.requestBodyRPCGetBuildings.listen(function(o) {
    requestBodyCall({
        method : 'get_buildings',
        params : [
            o.bodyId
        ],
        success : 'successBodyRPCGetBuildings',
        error   : 'failureBodyRPCGetBuildings'
    });
});

BodyRPCActions.requestBodyRPCSetColonyNotes.listen(function(o) {
    requestBodyCall({
        method : 'set_colony_notes',
        params : [
            o.bodyId,
            {
                notes : o.notes
            }
        ],
        success : 'successBodyRPCSetColonyNotes',
        error   : 'successBodyRPCSetColonyNotes'
    });
});

module.exports = BodyRPCActions;
