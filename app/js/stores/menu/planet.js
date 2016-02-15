'use strict';

var Reflux     = require('reflux');

var MapActions = require('js/actions/menu/map');

var MapModeStore = Reflux.createStore({

    listenables : [
        MapActions
    ],

    onChangePlanet : function(id) {
        console.log('Changing to planet (#' + id + ').');
        this.trigger(id);
    }
});

module.exports = MapModeStore;
