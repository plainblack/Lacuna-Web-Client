
'use strict';

var Reflux               = require('reflux');
var _                    = require('lodash');
var StatefulStore        = require('js/stores/mixins/stateful');

var moment               = require('moment');

var util                 = require('js/util');
var clone                = util.clone;

var SitterManagerActions = require('js/actions/windows/sitterManager');
var TickerActions        = require('js/actions/ticker');

var server               = require('js/server');

var SittersRPCStore = Reflux.createStore({
    listenables : [
        SitterManagerActions,
        TickerActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return [];
    },

    handleNewSitters : function(result) {
        var now = Date.now();

        var sitters = _.chain(result.sitters)
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

        this.emit(sitters);
    },

    onTick : function() {
        var sitters = clone(this.state);
        var now = Date.now();

        sitters = _.filter(sitters, function(sitter) {
            // Note: date objects can be compared numeracally,
            // see: http://stackoverflow.com/a/493018/1978973
            return now < util.serverDateToDateObj(sitter.expiry);
        });

        this.emit(sitters);
    },

    onLoad : function() {
        server.call({
            module  : 'empire',
            method  : 'view_authorized_sitters',
            params  : [],
            success : this.handleNewSitters,
            scope   : this
        });
    },

    onAuthorizeAllies : function() {
        server.call({
            module : 'empire',
            method : 'authorize_sitters',
            params : [{
                allied : true
            }],
            success : this.handleNewSitters,
            scope   : this
        });
    },

    onAuthorizeAlliance : function(allianceName) {
        server.call({
            module : 'empire',
            method : 'authorize_sitters',
            params : [{
                alliance : allianceName
            }],
            success : this.handleNewSitters,
            scope   : this
        });
    },

    onAuthorizeEmpire : function(empireName) {
        server.call({
            module : 'empire',
            method : 'authorize_sitters',
            params : [{
                empires : [empireName]
            }],
            success : this.handleNewSitters,
            scope   : this
        });
    },

    onDeauthorizeEmpire : function(empireId) {
        server.call({
            module : 'empire',
            method : 'deauthorize_sitters',
            params : [{
                empires : [empireId]
            }],
            success : this.handleNewSitters,
            scope   : this
        });
    },

    onReauthorizeAll : function() {
        server.call({
            module : 'empire',
            method : 'authorize_sitters',
            params : [{
                revalidate_all : true
            }],
            success : this.handleNewSitters,
            scope   : this
        });
    },

    onDeauthorizeAll : function() {
        server.call({
            module : 'empire',
            method : 'deauthorize_sitters',
            params : [{
                empires : _.map(this.state, 'id')
            }],
            success : this.handleNewSitters,
            scope   : this
        });
    }
});

module.exports = SittersRPCStore;
