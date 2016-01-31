
'use strict';

var Reflux = require('reflux');
var _ = require('lodash');

var moment = require('moment')

var util = require('js/util')

var SittersActions = require('js/actions/window/sitters');
var TickerActions = require('js/actions/ticker');

var server = require('js/server');

var SittersRPCStore = Reflux.createStore({
    listenables: [
        SittersActions,
        TickerActions
    ],

    init: function() {
        this.data = this.getInitialState();
    },

    getInitialState: function() {
        if (this.data) {
            return this.data;
        } else {
            return [];
        }
    },

    handleNewData: function(sitters) {
        var now = Date.now();

        return _.chain(sitters)
            .filter(function(sitter) {
                // Note: date objects can be compared numeracally,
                // see: http://stackoverflow.com/a/493018/1978973
                return now < util.serverDateToDateObj(sitter.expiry);
            })
            .map(function(sitter) {
                sitter.ends = moment().to(util.serverDateToMoment(sitter.expiry));
                return sitter;
            })
            .value();
    },

    onTick: function() {
        var now = Date.now();
        this.data = _.filter(this.data, function(sitter) {
            // Note: date objects can be compared numeracally,
            // see: http://stackoverflow.com/a/493018/1978973
            return now < util.serverDateToDateObj(sitter.expiry);
        });

        this.trigger(this.data);
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
                this.data = this.handleNewData(result.sitters);
                this.trigger(this.data);
            },
            scope: this
        });
    },

    onAuthorizeAllies: function() {
        server.call({
            module: 'empire',
            method: 'authorize_sitters',
            params: [{
                allied: true
            }],
            success: function(result) {
                this.data = this.handleNewData(result.sitters);
                this.trigger(this.data);
            },
            scope: this
        });
    },

    onAuthorizeAlliance: function(allianceName) {
        server.call({
            module: 'empire',
            method: 'authorize_sitters',
            params: [{
                alliance: allianceName
            }],
            success: function(result) {
                this.data = this.handleNewData(result.sitters);
                this.trigger(this.data);
            },
            scope: this
        });
    },

    onAuthorizeEmpire: function(empireName) {
        server.call({
            module: 'empire',
            method: 'authorize_sitters',
            params: [{
                empires: [empireName]
            }],
            success: function(result) {
                this.data = this.handleNewData(result.sitters);
                this.trigger(this.data);
            },
            scope: this
        });
    },

    onDeauthorizeEmpire: function(empireId) {
        server.call({
            module: 'empire',
            method: 'deauthorize_sitters',
            params: [{
                empires: [empireId]
            }],
            success: function(result) {
                this.data = this.handleNewData(result.sitters);
                this.trigger(this.data);
            },
            scope: this
        });
    },

    onReauthorizeAll: function() {
        server.call({
            module: 'empire',
            method: 'authorize_sitters',
            params: [{
                revalidate_all: true
            }],
            success: function(result) {
                this.data = this.handleNewData(result.sitters);
                this.trigger(this.data);
            },
            scope: this
        });
    },

    onDeauthorizeAll: function() {
        server.call({
            module: 'empire',
            method: 'deauthorize_sitters',
            params: [{
                empires: _.pluck(this.data, 'id')
            }],
            success: function(result) {
                this.data = this.handleNewData(result.sitters);
                this.trigger(this.data);
            },
            scope: this
        });
    }
});

module.exports = SittersRPCStore;
