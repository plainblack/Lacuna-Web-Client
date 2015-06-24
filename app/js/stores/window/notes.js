'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var NotesActions = require('js/actions/window/notes');

var NotesWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: NotesActions,

    getInitialState: function() {
        this.data = false;
        return this.data;
    }
});

module.exports = NotesWindowStore;
