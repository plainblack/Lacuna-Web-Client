'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var StatsActions = require('js/actions/window/stats');
var KeyboardActions = require('js/actions/keyboard');

var StatsWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: [StatsActions, KeyboardActions]
});

module.exports = StatsWindowStore;
