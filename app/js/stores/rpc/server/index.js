'use strict';

var Reflux = require('reflux');
var _ = require('lodash');

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
            serverMoment: moment(),
            clientMoment: moment(),
            serverFormattedTime: '',
            clientFormattedTime: '',
            version : 123456789,
            announcement : 0,
            promotions: [],
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

            // TODO: show announcement window if needed.

            this.data.serverMoment = util.serverDateToMoment(this.data.time).utcOffset(0);
            this.data.clientMoment = util.serverDateToMoment(this.data.time);

            this.trigger(this.data);
        }
    },

    onClear: function() {
        this.data = this.getInitialState();
        this.trigger(this.data);
    },

    onTick: function() {
        this.data.serverMoment = this.data.serverMoment.add(1, 'second');
        this.data.serverFormattedTime = util.formatMomentLong(this.data.serverMoment);

        this.data.clientMoment = this.data.clientMoment.add(1, 'second');
        this.data.clientFormattedTime = util.formatMomentLong(this.data.clientMoment);

        // if the promotion has ended, clear it so it can be removed from the user's
        // notice.
        if (this.data.promotions &&
            this.data.promotions.length)
        {
            var dt = new Date();
            if (_.findIndex(this.data.promotions,
                            function(promo) {
                                return dt < util.serverDateToDateObj(promo.end_date)
                            }) < 0)
            {
                delete this.data.promotions;
            }
        }

        this.trigger(this.data);
    }
});

module.exports = ServerRPCStore;
