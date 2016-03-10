'use strict';

var Reflux              = require('reflux');

var WindowMixinStores   = require('js/stores/mixins/window');

var NotesWindowActions  = require('js/actions/windows/notes');
var KeyboardActions     = require('js/actions/keyboard');

var NotesWindowStore = Reflux.createStore({
    mixins      : [WindowMixinStores],
    listenables : [NotesWindowActions, KeyboardActions],

    getDefaultData : function() {
        return {
            show : false
        };
    },

    getData : function() {
        return this.state;
    },

    getInitialState : function() {
        if (this.state) {
            this.state = this.getDefaultData();
        }
        return this.state;
    },

    init : function() {
        this.state = this.getDefaultData();
    },

    onNotesWindowShow : function() {
        this.state = true;
        this.trigger(this.state);
    },

    onNotesWindowHide : function() {
        this.state = false;
        this.trigger(this.state);
    }

});

module.exports = NotesWindowStore;
