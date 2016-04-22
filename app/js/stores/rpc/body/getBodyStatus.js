'use strict';

var Reflux                  = require('reflux');
var _                       = require('lodash');
var util                    = require('js/util');

var BodyRPCActions          = require('js/actions/rpc/body');

var StatefulMixinsStore     = require('js/stores/mixins/stateful');

var clone                   = util.clone;

var GetBodyStatusRPCStore = Reflux.createStore({
    listenables : [
        BodyRPCActions
    ],

    mixins : [
        StatefulMixinsStore
    ],

    getDefaultData : function() {
        var state = {
            id : 0,
            image : '',
            name : '',
            notes : '',
            orbit : 0,
            size : 0,
            star_id : 0,
            star_name : '',
            type : '',
            water : 0,
            x : 0,
            y : 0,
            zone : "",
            empire : {},
            ore : {
                anthracite : 0,
                bauxite : 0,
                beryl : 0,
                chalcopyrite : 0,
                chromite : 0,
                fluorite : 0,
                galena : 0,
                goethite : 0,
                gold : 0,
                gypsum : 0,
                halite : 0,
                kerogen : 0,
                magnetite : 0,
                monazite : 0,
                rutile : 0,
                sulfur : 0,
                trona : 0,
                uraninite : 0,
                zircon : 0
            }
        };
        return state;
    },

    handleNewData : function(result) {
        var state = clone(this.state);

        state = result.body ;

        this.emit(state);
    },

    onSuccessBodyRPCGetBodyStatus : function(result) {
        this.handleNewData(result);
    },

});
    
module.exports = GetBodyStatusRPCStore;
