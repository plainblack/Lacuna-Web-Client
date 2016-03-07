'use strict';

var Reflux = require('reflux');

var MapActions = Reflux.createActions([
    'mapShowPlanet',
    'mapShowStars',
    'mapToggleMode',
    'mapChangePlanet'
]);

module.exports = MapActions;
