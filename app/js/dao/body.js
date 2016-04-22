'use strict';

var dao                 = require('js/dao');
var BodyRPCActions      = require('js/actions/rpc/body');

function makeBodyCall(options) {
    dao.makeServerCall('body', options, BodyRPCActions);
}

BodyRPCActions.requestBodyRPCAbandon.listen(function(o) {
    makeBodyCall({
        method  : 'abandon',
        params  : [],
        success : 'successBodyRPCAbandon',
        error   : 'failureBodyRPCAbandon'
    });
});

BodyRPCActions.requestBodyRPCRename.listen(function(o) {
    makeBodyCall({
        method  : 'rename',
        params  : [],
        success : 'successBodyRPCRename',
        error   : 'failureBodyRPCRename'
    });
});

BodyRPCActions.requestBodyRPCGetBuildings.listen(function(o) {
    makeBodyCall({
        method : 'get_buildings',
        params : [o.bodyId],
        success : 'successBodyRPCGetBuildings',
        error   : 'failureBodyRPCGetBuildings'
    });
});

BodyRPCActions.requestBodyRPCGetBuildable.listen(function(o) {
    makeBodyCall({
        method : 'get_buildable',
        params : [],
        success : 'successBodyRPCGetBuildable',
        error   : 'failureBodyRPCGetBuildable'
    });
});

BodyRPCActions.requestBodyRPCGetBuildableLocations.listen(function(o) {
    makeBodyCall({
        method : 'get_buildable_locations',
        params : [],
        success : 'successBodyRPCGetBuildableLocations',
        error   : 'failureBodyRPCGetBuildableLocations'
    });
});

BodyRPCActions.requestBodyRPCGetStatus.listen(function(o) {
    makeBodyCall({
        method : 'get_status',
        params : [],
        success : 'successBodyRPCGetStatus',
        error   : 'failureBodyRPCGetStatus'
    });
});

BodyRPCActions.requestBodyRPCGetBodyStatus.listen(function(o) {
    makeBodyCall({
        method : 'get_body_status',
        params : [],
        success : 'successBodyRPCGetBodyStatus',
        error   : 'failureBodyRPCGetBodyStatus'
    });
});

BodyRPCActions.requestBodyRPCRepairList.listen(function(o) {
    makeBodyCall({
        method : 'repair_list',
        params : [],
        success : 'successBodyRPCRepairList',
        error   : 'failureBodyRPCRepairList'
    });
});

BodyRPCActions.requestBodyRPCRearrangeBuildings.listen(function(o) {
    makeBodyCall({
        method : 'rearrangeBuildings',
        params : [],
        success : 'successBodyRPCRearrangeBuildings',
        error   : 'failureBodyRPCRearrangeBuildings'
    });
});

BodyRPCActions.requestBodyRPCSetColonyNotes.listen(function(o) {
    makeBodyCall({
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

BodyRPCActions.requestBodyRPCViewLaws.listen(function(o) {
    makeBodyCall({
        method : 'view_laws',
        params : [],
        success : 'successBodyRPCViewLaws',
        error   : 'failureBodyRPCViewLaws'
    });
});

module.exports = BodyRPCActions;
