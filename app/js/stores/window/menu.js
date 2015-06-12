'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixin/window');

var MenuActions = require('js/actions/window/menu');

var MenuStore = Reflux.createStore({
    mixins: [Window],
    listenables: MenuActions
});

module.exports = MenuStore;