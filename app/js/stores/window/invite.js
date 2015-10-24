'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var InviteActions = require('js/actions/window/invite');
var KeyboardActions = require('js/actions/keyboard');

var InviteWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: [InviteActions, KeyboardActions]
});

module.exports = InviteWindowStore;
