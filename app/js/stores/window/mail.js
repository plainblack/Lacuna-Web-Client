'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var MailActions = require('js/actions/window/mail');

var MailWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: MailActions
});

module.exports = MailWindowStore;
