'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixin/window');

var OptionsActions = require('js/actions/window/options');

var OptionsStore = Reflux.createStore({
    mixins: [Window],
    listenables: OptionsActions
});

module.exports = OptionsStore;
