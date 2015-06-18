'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var AboutActions = require('js/actions/window/about');

var AboutStore = Reflux.createStore({
    mixins: [Window],
    listenables: AboutActions
});

module.exports = AboutStore;
