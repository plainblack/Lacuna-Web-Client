'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixin/window');

var InviteActions = require('js/actions/window/invite');

var InviteStore = Reflux.createStore({
    mixins: [Window],
    listenables: InviteActions
});

module.exports = InviteStore;
