'use strict';

var Reflux = require('reflux');

var BuildingActions = Reflux.createActions([
    'loadBuildingProduction',
    'clear'
]);

module.exports = BuildingActions;
