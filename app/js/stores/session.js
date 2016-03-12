'use strict';

var Reflux              = require('reflux');

var SessionActions      = require('js/actions/session');
var RPCEmpireActions    = require('js/actions/rpc/empire');

var StatefulStore       = require('js/stores/mixins/stateful');

var SessionStore = Reflux.createStore({

    listenables : [
        SessionActions,
        RPCEmpireActions
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

    onSuccessRPCEmpireLogout : function() {
        this.emit(this.getDefaultData());
    }
});

module.exports = SessionStore;
