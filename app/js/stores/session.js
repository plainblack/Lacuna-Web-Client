'use strict';

var Reflux              = require('reflux');

var SessionActions      = require('js/actions/session');
var RpcEmpireActions    = require('js/actions/rpc/empire');

var StatefulStore       = require('js/stores/mixins/stateful');

var SessionStore = Reflux.createStore({

    listenables : [
        SessionActions,
        RpcEmpireActions
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

    onSuccessRpcEmpireLogout : function() {
        this.emit(this.getDefaultData());
    }
});

module.exports = SessionStore;
