'use strict';

var Reflux              = require('reflux');

var SessionActions      = require('js/actions/session');
var EmpireRPCActions    = require('js/actions/rpc/empire');

var StatefulStore       = require('js/stores/mixins/stateful');

var SessionStore = Reflux.createStore({

    listenables : [
        SessionActions,
        EmpireRPCActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return '';
    },

    onSessionSet : function(session) {
        this.emit(session);
    },

    onSessionClear : function() {
        this.emit(this.getDefaultData());
    },

    onSuccessEmpireRPCLogout : function() {
        this.emit(this.getDefaultData());
    }
});

module.exports = SessionStore;
