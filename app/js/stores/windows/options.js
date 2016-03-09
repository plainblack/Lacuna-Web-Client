'use strict';

var Reflux                  = require('reflux');

var WindowMixinStore       = require('js/stores/mixins/window');

var OptionsWindowActions    = require('js/actions/windows/options');
var KeyboardActions         = require('js/actions/keyboard');

var OptionsWindowStore = Reflux.createStore({
    mixins      : [WindowMixinStore],
    listenables : [OptionsWindowActions, KeyboardActions]
});

module.exports = OptionsWindowStore;
