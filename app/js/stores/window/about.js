'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var AboutActions = require('js/actions/window/about');
var KeyboardActions = require('js/actions/keyboard');

var AboutWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: [AboutActions, KeyboardActions]
});

module.exports = AboutWindowStore;
