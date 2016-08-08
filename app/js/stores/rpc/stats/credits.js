'use strict';

var Reflux              = require('reflux');
var _                   = require('lodash');

var StatefulMixinStore  = require('js/stores/mixins/stateful');

var StatsRPCActions     = require('js/actions/rpc/stats');

var CreditsStatsRPCStore = Reflux.createStore({

    listenables : [
        StatsRPCActions
    ],

    mixins : [
        StatefulMixinStore
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

    onSuccessStatsRPCGetCredits : function(result) {
        var credits = {};
        
        _.each(result, function(foo) {
            _.each(foo, function(names, header) {
                credits[header] = names;
            });
        });

        this.emit(credits);
    }
});

module.exports = CreditsStatsRPCStore;
