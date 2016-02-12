'use strict';

var Reflux          = require('reflux');

var Window          = require('js/stores/mixins/window');

var OptionsActions  = require('js/actions/windows/options');
var KeyboardActions = require('js/actions/keyboard');

var OptionsWindowStore = Reflux.createStore({
    mixins      : [Window],
    listenables : [OptionsActions, KeyboardActions]
});

module.exports = OptionsWindowStore;
