'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var AboutActions = require('js/actions/window/about');

var AboutWindowStore = Reflux.createStore({
    getInitialState: function() {
        return false;
    },
    mixins: [Window],
    listenables: AboutActions
});

module.exports = AboutWindowStore;
