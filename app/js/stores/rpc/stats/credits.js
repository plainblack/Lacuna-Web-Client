'use strict';

var Reflux = require('reflux');

var AboutActions = require('js/actions/window/about');

var server = require('js/server');

var CreditsRPCStore = Reflux.createStore({
    listenables: AboutActions,

    getInitialState: function() {
        return [];
    },

    onLoad: function() {
        server.call({
            module: 'stats',
            method: 'credits',
            params: [],
            addSession: false,
            scope: this,
            success: this.trigger
        });
    }
});

module.exports = CreditsRPCStore;
