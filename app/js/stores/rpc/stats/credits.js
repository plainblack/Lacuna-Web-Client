'use strict';

var Reflux          = require('reflux');
var _               = require('lodash');
var StatefulStore   = require('js/stores/mixins/stateful');

var AboutActions    = require('js/actions/windows/about');

var server          = require('js/server');

var CreditsRPCStore = Reflux.createStore({

    listenables : [
        AboutActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return {};
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

    handleNewCredits : function(result) {
        var credits = {};

        _.each(result, function(foo) {
            _.each(foo, function(names, header) {
                credits[header] = names;
            });
        });

        this.emit(credits);
    },

    onAboutLoad : function() {
        // The credits change very rarely so don't waste RPC's on them.
        if (_.keys(this.state).length > 0) {
            return;
        }

        server.call({
            module     : 'stats',
            method     : 'credits',
            params     : [],
            addSession : false,
            scope      : this,
            success    : this.handleNewCredits
        });
    }
});

module.exports = CreditsRPCStore;
