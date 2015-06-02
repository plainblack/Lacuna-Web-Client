'use strict';

var Reflux = require('reflux');

var MapActions = Reflux.createActions([
    'showPlanetMap',
    'showStarMap',
    'toggleMapMode'
]);

module.exports = MapActions;
