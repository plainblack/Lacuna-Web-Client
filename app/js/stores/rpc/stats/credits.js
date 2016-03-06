'use strict';

var Reflux          = require('reflux');
var _               = require('lodash');
var StatefulStore   = require('js/stores/mixins/stateful');

var RpcStatsActions    = require('js/actions/rpc/stats');

var server          = require('js/server');

var CreditsRPCStore = Reflux.createStore({

    listenables : [
        RpcStatsActions
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

    onSuccessGetCredits : function(result) {
        var credits = {};
        
        _.each(result, function(foo) {
            _.each(foo, function(names, header) {
                credits[header] = names;
            });
        });

        this.emit(credits);
    }
});

module.exports = CreditsRPCStore;
