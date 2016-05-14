'use strict';

var Reflux                  = require('reflux');
var _                       = require('lodash');
var util                    = require('js/util');

var SpacePortRPCActions     = require('js/actions/rpc/spacePort');

var StatefulMixinsStore     = require('js/stores/mixins/stateful');

var clone                   = util.clone;

var ViewAllFleetsSpacePortRPCStore = Reflux.createStore({
    listenables : [
        SpacePortRPCActions
    ],

    mixins : [
        StatefulMixinsStore
    ],

    getDefaultData : function() {
        var state = {
            fleets : [],
            number_of_fleets : 0
        };
        return state;
    },

    handleNewData : function(result) {
        var state = clone(this.state);

        state.fleets            = result.fleets ;
        state.number_of_fleets  = result.number_of_fleets * 1;

        this.emit(state);
    },

    onSuccessSpacePortRPCViewAllFleets : function(result) {
        this.handleNewData(result);
    },

});
    
module.exports = ViewAllFleetsSpacePortRPCStore;
