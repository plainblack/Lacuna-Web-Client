'use strict';

var Reflux = require('reflux');

var StatusActions = require('js/actions/status');

var ServerRPCStore = Reflux.createStore({
    listenables: StatusActions,

    data: {},

    getInitialState: function() {
        this.data = {
            time : '01 31 2010 13:09:05 +0600',
            version : 123456789,
            announcement : 0,
            rpc_limit : 10000,
            star_map_size : {
                x : [ -15, 15 ],
                y : [ -15, 15 ],
                z : [ -15, 15 ]
            }
        };

        return this.data;
    },

    getData: function() {
        return this.data;
    },

    onUpdate: function(status) {
        if (!status.server) {
            return;
        } else {
            this.data = status.server;

            // Possible things to do here:
            //  ~ Change the time into a Date object.

            this.trigger(this.data);
        }
    },

    onClear: function() {
        this.data = this.getInitialState();
        this.trigger(this.data);
    }
});

module.exports = ServerRPCStore;
