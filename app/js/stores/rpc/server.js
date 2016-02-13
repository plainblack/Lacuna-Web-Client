'use strict';

var Reflux              = require('reflux');
var _                   = require('lodash');
var util                = require('js/util');
var moment              = require('moment');

var ServerStatusActions = require('js/actions/serverStatus');
var TickerActions       = require('js/actions/ticker');

var ServerRPCStore = Reflux.createStore({
    listenables : [
        ServerStatusActions,
        TickerActions
    ],

    init : function() {
        this.data = this.getInitialState();
    },

    getInitialState : function() {
        return {
            time          : '01 31 2010 13:09:05 +0600',
            version       : 123456789,
            announcement  : 0,
            promotions    : [],
            rpc_limit     : 10000,
            star_map_size : {
                x : [ -15, 15 ],
                y : [ -15, 15 ],
                z : [ -15, 15 ]
            }
        };
    },

    getData : function() {
        return this.data;
    },

    onServerStatusUpdate : function(serverStatus) {
        this.data = serverStatus;

        // TODO: show announcement window if needed.

//        this.data.serverMoment = util.serverDateToMoment(this.data.time).utcOffset(0);
//        this.data.clientMoment = util.serverDateToMoment(this.data.time);

        // The server won't return the promotions block if there aren't any.
        if (!this.data.promotions) {
            this.data.promotions = [];
        }

        this.data.promotions = _.map(this.data.promotions, this.handlePromotion);

        this.trigger(this.data);
    },

    onServerStatusClear : function() {
        this.data = this.getInitialState();
        this.trigger(this.data);
    },

    handlePromotion : function(promotion) {
        promotion.header = promotion.title || 'Awesome Promotion';
        promotion.ends = moment().to(util.serverDateToMoment(promotion.end_date));

        return promotion;
    }
});

module.exports = ServerRPCStore;
