'use strict';

// This is just a basic store that updates once a second.
// Useful for views which require a frequent update, e.g
// server clock or menu bars that show resource changes.
//

var Reflux          = require('reflux');
var _               = require('lodash');

var TickerActions   = require('js/actions/ticker');

var StatefulStore   = require('js/stores/mixins/stateful');
var clone           = require('js/util').clone;

var INTERVAL_TIME   = 1000;

var TickerStore = Reflux.createStore({

    listenables : [
        TickerActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return {
            ticking    : false,
            interval   : _.noop,
            clockTicks : 0
        };
    },

    tick : function() {
        TickerActions.tickerTick();

        var state = clone(this.state);

        state.clockTicks += 1;

        this.emit(state);
    },

    onTickerStart : function() {
        if (!this.state.ticking) {
            var state = clone(this.state);

            state.interval = setInterval(this.tick, INTERVAL_TIME);
            state.ticking = true;

            this.emit(state);
        }
    },

    onTickerStop : function() {
        if (this.ticking) {
            clearInterval(this.state.interval);
            this.emit(this.getDefaultData());
        }
    }
});

module.exports = TickerStore;
