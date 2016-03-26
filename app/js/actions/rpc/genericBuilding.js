'use strict';

var Reflux  = require('reflux');

var GenericBuildingRPCActions = Reflux.createActions([
    'requestGenericBuildingRPCView',
    'successGenericBuildingRPCView',
    'failureGenericBuildingRPCView',
    
    'requestGenericBuildingRPCUpgrade',
    'successGenericBuildingRPCUpgrade',
    'failureGenericBuildingRPCUpgrade',
    
    'requestGenericBuildingRPCDemolish',
    'successGenericBuildingRPCDemolish',
    'failureGenericBuildingRPCDemolish',
    
    'requestGenericBuildingRPCDowngrade',
    'successGenericBuildingRPCDowngrade',
    'failureGenericBuildingRPCDowngrade',
    
    'requestGenericBuildingRPCRepair',
    'successGenericBuildingRPCRepair',
    'failureGenericBuildingRPCRepair'
]);

module.exports = GenericBuildingRPCActions;
