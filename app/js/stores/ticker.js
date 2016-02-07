'use strict';

// This is just a basic store that updates once a second.
// Useful for views which require a frequent update, e.g
// server clock or menu bars that show resource changes.
//

var Reflux          = require('reflux');
var _               = require('lodash');

var TickerActions   = require('js/actions/ticker');

var TickerStore = Reflux.createStore({
    listenables: TickerActions,

    init: function() {
        this.data = this.getInitialState();
    },

    getInitialState: function() {
        return {
            ticking         : false,
            interval        : _.noop,
            intervalTime    : 1000,
            clockTicks      : 0
        };
    },

    reset: function() {
        this.data.ticking = false;
        this.data.interval = _.noop;
        this.trigger(this.data);
    },

    tick: function() {
        TickerActions.tickerTick();
        this.data.clockTicks += 1;
        this.trigger(this.data);
    },

    onTickerStart: function() {
        if (!this.data.ticking) {
            this.data.interval = setInterval(this.tick, this.data.intervalTime);
            this.data.ticking = true;
        }
        this.trigger(this.data);
    },

    onTickerStop: function() {
        if (this.ticking) {
            clearInterval(this.data.interval);
            this.reset();
        }
        this.trigger(this.data);
    },

});

module.exports = TickerStore;
