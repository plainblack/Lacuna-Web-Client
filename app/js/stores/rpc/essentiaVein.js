'use strict';

var Reflux               = require('reflux');

var BuildingActions      = require('js/actions/windows/building');
var EssentiaVeinActions  = require('js/actions/buildings/essentiaVein');
var WindowManagerActions = require('js/actions/windowManager');

var server               = require('js/server');

var EssentiaVeinStore = Reflux.createStore({

    listenables : [
        EssentiaVeinActions
    ],

    onDrainVein : function(id, times) {
        server.call({
            module : 'essentiavein',
            method : 'drain',
            params : [
                id,
                times
            ],
            scope   : this,
            success : function(result) {
                BuildingActions.updateBuilding(result.building);
                WindowManagerActions.hideTopWindow();
            }
        });
    }
});

module.exports = EssentiaVeinStore;
