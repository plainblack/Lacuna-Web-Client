'use strict';

var Reflux                  = require('reflux');
var _                       = require('lodash');
var validator               = require('validator');
var util                    = require('js/util');
var server                  = require('js/server');

var EssentiaWindowActions   = require('js/actions/windows/essentia');
var TickerActions           = require('js/actions/ticker');

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
        EssentiaWindowActions,
        TickerActions
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

    onLoadBoosts : function() {
        server.call({
            module  : 'empire',
            method  : 'view_boosts',
            params  : [],
            scope   : this,
            success : this.handleNewBoosts
        });
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
            method  : 'boost_' + type,
            params  : [weeks],
            scope   : this,
            success : function(result) {
                var boosts = clone(this.state);
                var newBoostTimestamp = result[type + '_boost'];
                boosts[type] = this.handleNewBoost(newBoostTimestamp);
                this.emit(boosts);
            }
        });
    }
});

module.exports = BoostsEmpireRPCStore;
