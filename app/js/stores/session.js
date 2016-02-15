'use strict';

var Reflux         = require('reflux');

var SessionActions = require('js/actions/session');

var StatefulStore  = require('js/stores/mixins/stateful');

var SessionStore = Reflux.createStore({

    listenables : [
        SessionActions
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
    }
});

module.exports = SessionStore;
