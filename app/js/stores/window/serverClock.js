'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var ServerClockActions = require('js/actions/window/serverClock');

var ServerClockWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: ServerClockActions,

    getInitialState: function() {
        this.data = false;
        return this.data;
    }
});

module.exports = ServerClockWindowStore;
