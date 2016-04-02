'use strict';

var Reflux                  = require('reflux');
var _                       = require('lodash');
var util                    = require('js/util');

var ShipyardRPCActions      = require('js/actions/rpc/shipyard');

var StatefulMixinsStore     = require('js/stores/mixins/stateful');

var clone                   = util.clone;

var GetBuildableShipyardRPCStore = Reflux.createStore({
    listenables : [
        ShipyardRPCActions
    ],

    mixins : [
        StatefulMixinsStore
    ],

    getDefaultData : function() {
        var state = {
            buildable : {},
            docks_available : 0,
            build_queue_max : 0,
            build_queue_used : 0
        };
        return state;
    },

    handleNewData : function(result) {
        var state = clone(this.state);

        state.buildable         = result.buildable ;
        state.docks_available   = result.docks_available + 0;
        state.build_queue_max   = result.build_queue_max + 0;
        state.build_queue_used  = result.build_queue_used + 0;

        this.emit(state);
    },

    onSuccessShipyardRPCGetBuildable : function(result) {
        this.handleNewData(result);
    },

});
    
module.exports = GetBuildableShipyardRPCStore;
