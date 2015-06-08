'use strict';

var Reflux = require('reflux');

var MapActions = Reflux.createActions([
    'showPlanetMap',
    'showStarMap',
    'toggleMapMode',
    'changePlanet'
]);

module.exports = MapActions;
