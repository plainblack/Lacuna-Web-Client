'use strict';

var Reflux  = require('reflux');

var GenericBuildingRPCActions = Reflux.createActions([
    'requestGenericBuildingRPCView',
    'successGenericBuildingRPCView',
    'failureGenericBuildingRPCView',
]);

module.exports = GenericBuildingRPCActions;
