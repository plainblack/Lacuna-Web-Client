'use strict';

var Reflux = require('reflux');

var MapActions = require('js/actions/menu/map');

var PLANET_MAP_MODE = 'planetMap';
var STAR_MAP_MODE = 'starmap';

var MapModeStore = Reflux.createStore({
    listenables: MapActions,

    // Display the last mode that was used.
    mapMode: localStorage.mapMode || PLANET_MAP_MODE,

    setMapMode: function(mode) {
        this.mapMode = localStorage.mapMode = mode;
        this.trigger(mode);
    },

    onShowPlanetMap: function() {
        this.setMapMode(PLANET_MAP_MODE);
    },

    onShowStarMap: function() {
        this.setMapMode(STAR_MAP_MODE);
    },

    onToggleMapMode: function() {
        this.setMapMode(this.mapMode === PLANET_MAP_MODE ? STAR_MAP_MODE : PLANET_MAP_MODE);
    }
});

module.exports = MapModeStore;
module.exports.PLANET_MAP_MODE = PLANET_MAP_MODE;
module.exports.STAR_MAP_MODE = STAR_MAP_MODE;
