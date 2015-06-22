'use strict';

var Reflux = require('reflux');

var MapActions = require('js/actions/menu/map');

var PLANET_MAP_MODE = 'planetMap';
var STAR_MAP_MODE = 'starMap';

var MapModeStore = Reflux.createStore({
    listenables: MapActions,

    mapMode: undefined,

    getInitialState: function() {
        this.mapMode = PLANET_MAP_MODE;
        return this.mapMode;
    },

    setMapMode: function(mapMode) {
        if (mapMode !== this.mapMode) {
            this.mapMode = mapMode;
            this.trigger(this.mapMode);
        }
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
