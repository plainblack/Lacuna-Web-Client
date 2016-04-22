'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var BodyRPCActions = Reflux.createActions([
    'requestBodyRPCAbandon',
    'successBodyRPCAbandon',
    'failureBodyRPCAbandon',

    'requestBodyRPCRename',
    'successBodyRPCRename',
    'failureBodyRPCRename',

    'requestBodyRPCGetBuildings',
    'successBodyRPCGetBuildings',
    'failureBodyRPCGetBuildings',

    'requestBodyRPCGetBuildable',
    'successBodyRPCGetBuildable',
    'failureBodyRPCGetBuildable',

    'requestBodyRPCGetBuildableLocations',
    'successBodyRPCGetBuildableLocations',
    'failureBodyRPCGetBuildableLocations',

    'requestBodyRPCGetStatus',
    'successBodyRPCGetStatus',
    'failureBodyRPCGetStatus',

    'requestBodyRPCGetBodyStatus',
    'successBodyRPCGetBodyStatus',
    'failureBodyRPCGetBodyStatus',

    'requestBodyRPCRepairList',
    'successBodyRPCRepairList',
    'failureBodyRPCRepairList',

    'requestBodyRPCRearrangeBuildings',
    'successBodyRPCRearrangeBuildings',
    'failureBodyRPCRearrangeBuildings',

    'requestBodyRPCSetColonyNotes',
    'successBodyRPCSetColonyNotes',
    'failureBodyRPCSetColonyNotes',

    'requestBodyRPCViewLaws',
    'successBodyRPCViewLaws',
    'failureBodyRPCViewLaws'

]);

module.exports = BodyRPCActions;
