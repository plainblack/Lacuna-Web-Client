'use strict';

var Reflux = require('reflux');

var LoaderActions = require('js/actions/menu/loader');

var Window = require('js/stores/mixins/window');

var LoaderStore = Reflux.createStore({
    listenables: LoaderActions,
    mixins: [Window]
});

module.exports = LoaderStore;
