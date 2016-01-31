'use strict';

var Reflux = require('reflux');
var _ = require('lodash');

var TickerActions       = require('js/actions/ticker');
var ServerStatusActions = require('js/actions/serverStatus');

var TickerStore = Reflux.createStore({
    listenables: TickerActions,

    init: function() {
        this.ticking        = false;
        this.interval       = _.noop;
        this.intervalTime   = 1000;
        this.serverTime     = 0;
    },

    reset: function() {
        this.ticking = false;
        this.interval = _.noop;
    },

    tick: function() {
        TickerActions.tickerTick();
    },

    onServerStatusTime: function(serverTime) {
        this.serverTime = serverTime;
    },

    onTickerStart: function() {
        if (!this.ticking) {
            this.interval = setInterval(this.tick, this.intervalTime);
            this.ticking = true;
        }
    },

    onTickerStop: function() {
        if (this.ticking) {
            clearInterval(this.interval);
            this.reset();
        }
    }
});

module.exports = TickerStore;
