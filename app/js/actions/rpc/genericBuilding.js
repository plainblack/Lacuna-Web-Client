'use strict';

var Reflux  = require('reflux');

var GenericBuildingRPCActions = Reflux.createActions([
    'requestGenericBuildingRPCView',
    'successGenericBuildingRPCView',
    'failureGenericBuildingRPCView',
    
    'requestGenericBuildingRPCRepair',
    'successGenericBuildingRPCRepair',
    'failureGenericBuildingRPCRepair'
]);

module.exports = GenericBuildingRPCActions;
