'use strict';

var Reflux              = require('reflux');

var WindowMixinStores   = require('js/stores/mixins/window');

var NotesWindowActions  = require('js/actions/windows/notes');
var KeyboardActions     = require('js/actions/keyboard');

var NotesWindowStore = Reflux.createStore({
    mixins      : [WindowMixinStores],
    listenables : [NotesWindowActions, KeyboardActions],

    onNotesWindowShow : function() {
        this.data = true;
        this.trigger(this.data);
    },

    onNotesWindowHide : function() {
        this.data = false;
        this.trigger(this.data);
    }

});

module.exports = NotesWindowStore;
