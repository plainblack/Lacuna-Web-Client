'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var MenuActions = require('js/actions/menu');

var MenuStore = Reflux.createStore({
    mixins: [Window],
    listenables: MenuActions
});

module.exports = MenuStore;
