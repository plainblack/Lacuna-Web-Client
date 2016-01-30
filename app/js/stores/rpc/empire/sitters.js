'use strict';

var Reflux = require('reflux');
var _ = require('lodash');

var SittersActions = require('js/actions/window/sitters');

var server = require('js/server');

var SittersRPCStore = Reflux.createStore({
    listenables: [
        SittersActions
    ],

    init: function() {
        this.data = this.getInitialState();
    },

    getInitialState: function() {
        return [];
    },

    onShow: function() {
        SittersActions.load();
    },

    onLoad: function() {
        server.call({
            module: 'empire',
            method: 'view_authorized_sitters',
            params: [],
            success: function(result) {
                this.data = result.sitters;
                this.trigger(this.data);
            },
            scope: this
        });
    }
});

module.exports = SittersRPCStore;
