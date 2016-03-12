'use strict';

var Reflux                      = require('reflux');

var BuildingWindowActions       = require('js/actions/windows/building');
var EssentiaVeinBuildingActions = require('js/actions/buildings/essentiaVein');
var WindowManagerActions        = require('js/actions/windowManager');

var server                      = require('js/server');

var EssentiaVeinRPCStore = Reflux.createStore({

    listenables : [
        EssentiaVeinBuildingActions
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
                BuildingWindowActions.buildingWindowUpdate(result.building);
                WindowManagerActions.hideTopWindow();
            }
        });
    }
});

module.exports = EssentiaVeinRPCStore;
