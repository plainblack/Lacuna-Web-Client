'use strict';

var Reflux                  = require('reflux');
var _                       = require('lodash');
var util                    = require('js/util');

var ShipyardRPCActions      = require('js/actions/rpc/shipyard');

var StatefulMixinsStore     = require('js/stores/mixins/stateful');

var clone                   = util.clone;

var BuildQueueShipyardRPCStore = Reflux.createStore({
    listenables : [
        ShipyardRPCActions
    ],

    mixins : [
        StatefulMixinsStore
    ],

    getDefaultData : function() {
        var state = {
            number_of_ships_building    : 0,
            number_of_fleets_building   : 0,
            cost_to_subsidize           : 0,
            fleets_building             : [],
        };
        return state;
    },

    handleNewData : function(result) {
        var state = clone(this.state);

        state.number_of_ships_building  = result.number_of_ships_building + 0;
        state.number_of_fleets_building = result.number_of_fleets_building + 0;
        state.cost_to_subsidize         = result.cost_to_subsidize + 0;
        state.fleets_building           = result.fleets_building || [];

        this.emit(state);
    },

    onSuccessShipyardRPCViewBuildQueue : function(result) {
        this.handleNewData(result);
    },

});
    
module.exports = BuildQueueShipyardRPCStore;
