'use strict';

var Reflux = require('reflux');

var SessionActions = require('js/actions/session');

var SessionStore = Reflux.createStore({
    listenables: SessionActions,

    init: function() {
        this.data = this.getInitialState();
    },

    getInitialState: function() {
        return '';
    },

    getData: function() {
        return this.data;
    },

    onSessionSet: function(session) {
        this.data = session;
        this.trigger(this.data);
    },

    onSessionClear: function() {
        this.trigger(this.getInitialState());
    }
});

module.exports = SessionStore;
