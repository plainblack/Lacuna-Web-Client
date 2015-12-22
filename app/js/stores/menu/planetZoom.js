'use strict';

var Reflux = require('reflux');
var _ = require('lodash');

var MapActions = require('js/actions/menu/map');

var util = require('js/util');

var ZOOM_LEVELS = {
    0: 50,
    1: 100,
    2: 300,
    3: 400
};

var PlanetZoomStore = Reflux.createStore({
    listenables: [
        MapActions
    ],

    init: function() {
        this.data = this.getInitialState();
    },

    getInitialState: function() {
        return localStorage.zoomLevel || ZOOM_LEVELS[1];
    },

    changeZoom: function(modifier) {
        // Invert so we can key by the current zoom level.
        var invertedLevels = _.invert(ZOOM_LEVELS);
        var index = util.int(invertedLevels[this.data]);
        var possibleNewIndex = index + modifier;

        var min = 0;
        var max = _.keys(ZOOM_LEVELS).length - 1;

        possibleNewIndex = _.max([possibleNewIndex, min]);
        possibleNewIndex = _.min([possibleNewIndex, max]);

        var rv = ZOOM_LEVELS[possibleNewIndex];
        localStorage.zoomLevel = rv;

        return rv;
    },

    onZoomPlanetIn: function() {
        this.data = this.changeZoom(1);
        this.trigger(this.data);
    },

    onZoomPlanetOut: function() {
        this.data = this.changeZoom(-1);
        this.trigger(this.data);
    }
});

module.exports = PlanetZoomStore;
