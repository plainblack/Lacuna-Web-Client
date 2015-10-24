'use strict';

var Reflux = require('reflux');

var StatusActions = require('js/actions/status');
var TickerActions = require('js/actions/ticker');

var util = require('js/util');

var moment = require('moment');

var ServerRPCStore = Reflux.createStore({
    listenables: [
        StatusActions,
        TickerActions
    ],

    init: function() {
        this.data = this.getInitialState();
    },

    getInitialState: function() {
        return {
            time : '01 31 2010 13:09:05 +0600',
            timeMoment: util.serverDateToMoment('01 31 2010 13:09:05 +0600'),
            displayTime: '',
            version : 123456789,
            announcement : 0,
            rpc_limit : 10000,
            star_map_size : {
                x : [ -15, 15 ],
                y : [ -15, 15 ],
                z : [ -15, 15 ]
            }
        };
    },

    getData: function() {
        return this.data;
    },

    onUpdate: function(status) {
        if (!status.server) {
            return;
        } else {
            this.data = status.server;

            // TODO: show announcement window if there is one.

            this.data.timeMoment = util.serverDateToMoment(this.data.time).zone(0);

            this.trigger(this.data);
        }
    },

    onClear: function() {
        this.data = this.getInitialState();
        this.trigger(this.data);
    },

    onTick: function() {
        this.data.timeMoment = this.data.timeMoment.add(1, 'second');
        this.data.displayTime = util.formatMomentLong(this.data.timeMoment);
        this.trigger(this.data);
    }
});

module.exports = ServerRPCStore;
