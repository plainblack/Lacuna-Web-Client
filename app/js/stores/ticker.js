'use strict';

var Reflux = require('reflux');
var _ = require('lodash');

var TickerActions = require('js/actions/ticker');

var TickerStore = Reflux.createStore({
    listenables: TickerActions,

    ticking: false,
    interval: _.noop,
    intervalTime: 1000,

    reset: function() {
        this.ticking = false;
        this.interval = _.noop;
    },

    onStart: function() {
        if (!this.ticking) {
            this.interval = setInterval(TickerActions.tick, this.intervalTime);
            this.ticking = true;
        }
    },

    onStop: function() {
        if (this.ticking) {
            clearInterval(this.interval);
            this.reset();
        }
    }
});

module.exports = TickerStore;
