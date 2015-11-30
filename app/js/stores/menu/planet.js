'use strict';

var Reflux = require('reflux');

var MapActions = require('js/actions/menu/map');

var PlanetStore = Reflux.createStore({
    listenables: MapActions,
    getInitialState: function() {
        return '';
    },
    onChangePlanet: function(id) {
        this.trigger(id);
    }
});

module.exports = PlanetStore;
