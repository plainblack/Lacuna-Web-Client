'use strict';

var Reflux = require('reflux');

var AboutActions = require('js/actions/window/about');

var server = require('js/server');

var CreditsRPCStore = Reflux.createStore({
    listenables: AboutActions,

    init: function() {
        this.data = this.getInitialState();
    },

    getInitialState: function() {
        return [];
    },

    hasData: function() {
        return _.keys(this.data) > 0;
    },

    // INPUT:
    //
    // [
    //     { 'Game Server' : ['JT Smith']},
    //     { 'iPhone Client' : ['Kevin Runde']},
    //     { 'Web Client' : ['John Rozeske']},
    //     { 'Play Testers' : ['John Ottinger', 'Jamie Vrbsky']}
    // ]
    //
    // OUTPUT
    // {
    //     'Game Server': ['JT Smith'],
    //     'iPhone Client': ['Kevin Runde'],
    //     'Web Client' : ['John Rozeske'],
    //     'Play Testers' : ['John Ottinger', 'Jamie Vrbsky']
    // }

    handleResult: function(result) {
        var newResult = {};

        _.each(result, function(foo) {
            _.each(foo, function(names, header) {
                newResult[header] = names;
            });
        });

        return newResult;
    },

    onShow: function() {
        AboutActions.load();
    },

    onLoad: function() {
        // The credits change very rarely so don't waste RPC's on them.
        if (this.hasData()) {
            return;
        }

        server.call({
            module: 'stats',
            method: 'credits',
            params: [],
            addSession: false,
            scope: this,
            success: function(result) {
                this.data = this.handleResult(result);
                this.trigger(this.data);
            }
        });
    }
});

module.exports = CreditsRPCStore;
