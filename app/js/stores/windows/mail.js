'use strict';

var Reflux              = require('reflux');

var WindowMixinStore    = require('js/stores/mixins/window');

var MailWindowActions   = require('js/actions/windows/mail');
var KeyboardActions     = require('js/actions/keyboard');

var MailWindowStore = Reflux.createStore({
    mixins      : [WindowMixinStore],
    listenables : [MailWindowActions, KeyboardActions],

    getDefaultData : function() {
        return {
            show : false
        };
    },

    getData : function() {
        return this.state;
    },

    getInitialState : function() {
        if (! this.state) {
            this.state = this.getDefaultData();
        }
        return this.state;
    },

    init : function() {
        this.state = this.getDefaultData();
    },

    onMailWindowShow : function() {
        this.state.show = true;
        this.trigger(this.state);
    },

    onMailWindowHide : function() {
        this.state.show = false;
        this.trigger(this.state);
    }

});

module.exports = MailWindowStore;
