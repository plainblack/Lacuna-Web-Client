'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var OptionsActions = require('js/actions/window/options');

var OptionsWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: OptionsActions,

    getInitialState: function() {
        this.data = false;
        return this.data;
    }
});

module.exports = OptionsWindowStore;
