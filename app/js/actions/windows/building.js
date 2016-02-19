'use strict';

var Reflux = require('reflux');

var BuildingActions = Reflux.createActions([
    'loadBuildingProduction',
    'clear',
    'upgradeBuilding',
    'downgradeBuilding',
    'demolishBuilding',
    'repairBuilding'
]);

module.exports = BuildingActions;
