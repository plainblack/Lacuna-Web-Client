'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixin/window');

var ServerClockActions = require('js/actions/window/serverClock');

var ServerClockStore = Reflux.createStore({
    mixins: [Window],
    listenables: ServerClockActions
});

module.exports = ServerClockStore;
