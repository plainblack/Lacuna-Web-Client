'use strict';

var Reflux                  = require('reflux');

var WindowMixinStore       = require('js/stores/mixins/window');

var OptionsWindowActions    = require('js/actions/windows/options');
var KeyboardActions         = require('js/actions/keyboard');

var OptionsWindowStore = Reflux.createStore({
    mixins      : [WindowMixinStore],
    listenables : [OptionsWindowActions, KeyboardActions],

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

    onOptionWindowShow : function() {
        this.state.show = true;
        this.trigger(this.state);
    },

    onOptionWindowHide : function() {
        this.state.show = false;
        this.trigger(this.state);
    }

});

module.exports = OptionsWindowStore;
