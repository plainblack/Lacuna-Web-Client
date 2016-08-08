
'use strict';

var Reflux                      = require('reflux');
var _                           = require('lodash');
var moment                      = require('moment');
var util                        = require('js/util');
var server                      = require('js/server');

var StatefulMixinStore          = require('js/stores/mixins/stateful');

var TickerActions               = require('js/actions/ticker');
var EmpireRPCActions            = require('js/actions/rpc/empire');

var clone                       = util.clone;

var SittersEmpireRPCStore = Reflux.createStore({
    listenables : [
        TickerActions,
        EmpireRPCActions
    ],

    mixins : [
        StatefulMixinStore
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

    onSuccessEmpireRPCViewAuthorizedSitters : function(result) {
        this.handleNewSitters(result);
    },

    onSuccessEmpireRPCAuthorizeSitters : function(result) {
        this.handleNewSitters(result);
    },
    
    onSuccessEmpireRPCDeauthorizeSitters : function(result) {
        this.handleNewSitters(result);
    }

});

module.exports = SittersEmpireRPCStore;
