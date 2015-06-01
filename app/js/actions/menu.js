'use strict';

var Reflux = require('reflux');

var MenuActions = Reflux.createActions([
    'show',
    'hide',
    'showPlanet',
    'showStarmap'
]);

module.exports = MenuActions;
