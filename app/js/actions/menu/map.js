'use strict';

var Reflux = require('reflux');

var MapActions = Reflux.createActions([
    'showPlanetMap',
    'showStarMap',
    'toggleMapMode',
    'changePlanet',
    'refresh',

    'addBuilding',
    'clearBuildings',
    'removeBuilding',
    'updateBuilding',
    'updateBuildings',

    'zoomPlanetIn',
    'zoomPlanetOut'
]);

module.exports = MapActions;
