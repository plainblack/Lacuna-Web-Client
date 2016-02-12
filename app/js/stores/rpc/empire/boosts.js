'use strict';

var Reflux          = require('reflux');
var _               = require('lodash');
var validator       = require('validator');

var EssentiaActions = require('js/actions/windows/essentia');
var TickerActions   = require('js/actions/ticker');

var EmpireRPCStore  = require('js/stores/rpc/empire');
var ServerRPCStore  = require('js/stores/rpc/server');

var server          = require('js/server');
var util            = require('js/util');

var BOOST_METHOD_MAP = {
    food         : 'boost_food',
    ore          : 'boost_ore',
    water        : 'boost_water',
    energy       : 'boost_energy',
    happiness    : 'boost_happiness',
    storage      : 'boost_storage',
    building     : 'boost_building',
    spy_training : 'boost_spy_training'
};

var BoostsRPCStore = Reflux.createStore({
    listenables : [
        EssentiaActions,
        TickerActions
    ],

    init : function() {
        this.data = this.getInitialState();
    },

    getInitialState : function() {
        if (this.data) {
            return this.data;
        } else {
            return {
                food : {
                    ms      : 0,
                    display : ''
                },
                ore : {
                    ms      : 0,
                    display : ''
                },
                water : {
                    ms      : 0,
                    display : ''
                },
                energy : {
                    ms      : 0,
                    display : ''
                },
                happiness : {
                    ms      : 0,
                    display : ''
                },
                storage : {
                    ms      : 0,
                    display : ''
                },
                building : {
                    ms      : 0,
                    display : ''
                },
                spy_training : {
                    ms      : 0,
                    display : ''
                }
            };
        }
    },

    addNewBoost : function(timestamp, boostName) {
        var millisecondsRemaining =
            util.serverDateToMs(timestamp) -
            util.serverDateToMs(ServerRPCStore.getData().time);

        this.data[boostName] = {
            ms      : millisecondsRemaining,
            display : util.formatMillisecondTime(millisecondsRemaining)
        };
    },

    handleNewBoostData : function(result) {
        this.data = {};
        _.each(result.boosts, this.addNewBoost, this);
        this.trigger(this.data);
    },

    onLoadBoosts : function() {
        server.call({
            module  : 'empire',
            method  : 'view_boosts',
            params  : [],
            scope   : this,
            success : this.handleNewBoostData
        });
    },

    onTick : function() {
        var tickBoost = function(boost) {
            boost.ms -= 1000;
            boost.display = util.formatMillisecondTime(boost.ms);
            return boost;
        };

        _.each(Object.keys(this.data), function(key) {
            this.data[key] = tickBoost(this.data[key]);
        }, this);

        this.trigger(this.data);
    },

    onBoost : function(type, weeks) {

        var essentia = EmpireRPCStore.getData().essentia;

        if (
            !validator.isInt(weeks, {
                min : 1,
                max : 100 // The server has no max but this seems like a reasonable limit, to me.
            })
        ) {
            window.alert('Number of weeks must be an integer between 1 and 100.');
            return;
        } else if (weeks * 5 > essentia) {
            window.alert('Insufficient Essentia.');
            return;
        }

        server.call({
            module  : 'empire',
            method  : BOOST_METHOD_MAP[type],
            params  : [weeks],
            scope   : this,
            success : function(result) {
                if (result.food_boost) { // Food
                    this.addNewBoost(result.food_boost, 'food');
                } else if (result.ore_boost) { // Ore
                    this.addNewBoost(result.ore_boost, 'ore');
                } else if (result.water_boost) { // Water
                    this.addNewBoost(result.water_boost, 'water');
                } else if (result.energy_boost) { // Energy
                    this.addNewBoost(result.energy_boost, 'energy');
                } else if (result.happiness_boost) { // Happiness
                    this.addNewBoost(result.happiness_boost, 'happiness');
                } else if (result.storage_boost) { // Storage
                    this.addNewBoost(result.storage_boost, 'storage');
                } else if (result.building_boost) { // Building Speed
                    this.addNewBoost(result.building_boost, 'building');
                } else if (result.spy_training_boost) { // Spy Training Speed
                    this.addNewBoost(result.spy_training_boost, 'spy_training');
                }

                this.trigger(this.data);
            }
        });
    }
});

module.exports = BoostsRPCStore;
