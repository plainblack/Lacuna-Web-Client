'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var AboutActions = require('js/actions/window/about');

var AboutWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: AboutActions,

    getInitialState: function() {
        this.data = false;
        return this.data;
    }
});

module.exports = AboutWindowStore;
