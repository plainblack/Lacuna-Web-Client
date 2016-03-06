'use strict';

var Reflux = require('reflux');

var BuildingActions = Reflux.createActions([
    'loadBuilding',
    'updateBuilding',
    'clear',
    'upgradeBuilding',
    'downgradeBuilding',
    'demolishBuilding',
    'repairBuilding'
]);

module.exports = BuildingActions;
