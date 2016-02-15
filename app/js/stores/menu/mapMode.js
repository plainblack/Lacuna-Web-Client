'use strict';

var Reflux          = require('reflux');

var MapActions      = require('js/actions/menu/map');

var StatefulStore   = require('js/stores/mixins/stateful');

var PLANET_MAP_MODE = 'planetMap';
var STAR_MAP_MODE   = 'starMap';

var MapModeStore = Reflux.createStore({

    listenables : [
        MapActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return PLANET_MAP_MODE;
    },

    onShowPlanetMap : function() {
        this.emit(PLANET_MAP_MODE);
    },

    onShowStarMap : function() {
        this.emit(STAR_MAP_MODE);
    },

    onToggleMapMode : function() {
        this.emit(this.getData() === PLANET_MAP_MODE
            ? STAR_MAP_MODE
            : PLANET_MAP_MODE
        );
    }
});

module.exports = MapModeStore;
module.exports.PLANET_MAP_MODE = PLANET_MAP_MODE;
module.exports.STAR_MAP_MODE = STAR_MAP_MODE;
