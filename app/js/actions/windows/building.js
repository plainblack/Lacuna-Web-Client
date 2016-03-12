'use strict';

var Reflux = require('reflux');

var BuildingWindowActions = Reflux.createActions([
    'buildingWindowLoad',
    'buildingWindowUpdate',
    'buildingWindowClear',
    'buildingWindowUpgrade',
    'buildingWindowDowngrade',
    'buildingWindowDemolish',
    'buildingWindowRepair'
]);

module.exports = BuildingWindowActions;
