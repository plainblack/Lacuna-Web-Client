'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var ServerClockActions = require('js/actions/window/serverClock');
var KeyboardActions = require('js/actions/keyboard');

var ServerClockWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: [ServerClockActions, KeyboardActions]
});

module.exports = ServerClockWindowStore;
