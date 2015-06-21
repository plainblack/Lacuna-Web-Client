'use strict';

var Reflux = require('reflux');

var SessionActions = require('js/actions/session');

var SessionStore = Reflux.createStore({
    listenables: SessionActions,

    data: '',

    getInitialState: function() {
        this.data = '';
        return this.data;
    },

    getData: function() {
        return this.data;
    },

    onSet: function(session) {
        this.data = session;
        this.trigger(this.data);
    },

    onClear: function() {
        this.trigger(this.getInitialState());
    }
});

module.exports = SessionStore;
