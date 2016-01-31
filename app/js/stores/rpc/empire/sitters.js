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
        if (this.data) {
            return this.data;
        } else {
            return [];
        }
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
    },

    onAuthorizeAllies: function() {
        server.call({
            module: 'empire',
            method: 'authorize_sitters',
            params: [{
                allied: true
            }],
            success: function(result) {
                this.data = result.auths;
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
                this.data = result.auths;
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
                this.data = result.auths;
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
                alert('Success!')
                console.log(result)
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
                this.data = result.auths;
                this.trigger(this.data);
            },
            scope: this
        });
    },

    onDeauthorizeAll: function() {
        var authorizedIds = _.pluck()

        server.call({
            module: 'empire',
            method: 'authorize_sitters',
            params: [{
                revalidate_all: true
            }],
            success: function(result) {
                this.data = result.auths;
                this.trigger(this.data);
            },
            scope: this
        });
    }
});

module.exports = SittersRPCStore;
