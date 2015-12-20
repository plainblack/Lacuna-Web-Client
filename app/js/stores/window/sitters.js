'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var SittersActions = require('js/actions/window/sitters');
var KeyboardActions = require('js/actions/keyboard');

var SittersWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: [SittersActions, KeyboardActions]
});

module.exports = SittersWindowStore;
