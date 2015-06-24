'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var StatsActions = require('js/actions/window/stats');

var StatsWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: StatsActions,

    getInitialState: function() {
        this.data = false;
        return this.data;
    }
});

module.exports = StatsWindowStore;
