'use strict';

var Reflux = require('reflux');

var MapActions = require('js/actions/menu/map');

var MapModeStore = Reflux.createStore({
    listenables: MapActions,
    onChangePlanet: function(id) {
        this.trigger(id);
    }
});

module.exports = MapModeStore;
