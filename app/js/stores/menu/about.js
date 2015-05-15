'use strict';

var Reflux = require('reflux');

var AboutActions = require('js/actions/menu/about');

var AboutStore = Reflux.createStore({
    listenables: AboutActions,

    onOpen: function() {
        this.trigger('');
    },

    onClose: function() {
        this.trigger('none');
    }
});

module.exports = AboutStore;
