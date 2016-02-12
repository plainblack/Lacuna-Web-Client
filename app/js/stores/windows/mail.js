'use strict';

var Reflux          = require('reflux');

var Window          = require('js/stores/mixins/window');

var MailActions     = require('js/actions/windows/mail');
var KeyboardActions = require('js/actions/keyboard');

var MailWindowStore = Reflux.createStore({
    mixins      : [Window],
    listenables : [MailActions, KeyboardActions]
});

module.exports = MailWindowStore;
