'use strict';

var Reflux              = require('reflux');

var WindowMixinStore    = require('js/stores/mixins/window');

var MailWindowActions   = require('js/actions/windows/mail');
var KeyboardActions     = require('js/actions/keyboard');

var MailWindowStore = Reflux.createStore({
    mixins      : [WindowMixinStore],
    listenables : [MailWindowActions, KeyboardActions],

    onMailWindowShow : function() {
        this.data = true;
        this.trigger(this.data);
    },

    onMailWindowHide : function() {
        this.data = false;
        this.trigger(this.data);
    }

});

module.exports = MailWindowStore;
