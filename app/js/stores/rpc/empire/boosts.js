'use strict';

var Reflux                  = require('reflux');
var _                       = require('lodash');
var util                    = require('js/util');

var TickerActions           = require('js/actions/ticker');
var EmpireRPCActions        = require('js/actions/rpc/empire');

var StatefulMixinsStore     = require('js/stores/mixins/stateful');
var EmpireRPCStore          = require('js/stores/rpc/empire');
var ServerRPCStore          = require('js/stores/rpc/server');

var clone                   = util.clone;

var BOOST_TYPES = [
    'food',
    'ore',
    'water',
    'energy',
    'happiness',
    'storage',
    'building',
    'spy_training'
];

var BoostsEmpireRPCStore = Reflux.createStore({
    listenables : [
        TickerActions,
        EmpireRPCActions
    ],

    mixins : [
        StatefulMixinsStore
    ],

    getDefaultData : function() {
        var defaultData = {};

        _.each(BOOST_TYPES, function(type) {
            defaultData[type] = {
                ms      : 0,
                display : ''
            };
        });

        return defaultData;
    },

    handleNewBoost : function(timestamp) {
        var millisecondsRemaining =
            util.serverDateToMs(timestamp) -
            util.serverDateToMs(ServerRPCStore.getData().time);

        if (timestamp && millisecondsRemaining > 0) {
            return {
                ms      : millisecondsRemaining,
                display : util.formatMillisecondTime(millisecondsRemaining)
            };
        } else {
            return {
                ms      : 0,
                display : ''
            };
        }
    },

    handleNewBoosts : function(result) {
        var boosts = clone(this.state);

        _.each(BOOST_TYPES, _.bind(function(type) {
            boosts[type] = this.handleNewBoost(result.boosts[type]);
        }, this));

        this.emit(boosts);
    },

    onTickerTick : function() {
        var boosts = clone(this.state);

        _.mapValues(boosts, function(boost) {
            if (boost.ms <= 0) {
                return {
                    ms      : 0,
                    display : ''
                };
            } else {
                boost.ms -= 1000;
                boost.display = util.formatMillisecondTime(boost.ms);

                return boost;
            }
        });

        this.emit(boosts);
    },

    onSuccessEmpireRPCViewBoosts : function(result) {
        this.handleNewBoosts(result);
    },

    onSuccessEmpireRPCBoost : function(result) {
        this.handleNewBoosts(result);
    },

    onFailureEmpireRPCBoost : function(result) {
        console.log('FAILURE Empire Boost');
    },
});
    
module.exports = BoostsEmpireRPCStore;
