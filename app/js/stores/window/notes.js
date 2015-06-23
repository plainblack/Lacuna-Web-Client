'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var NotesActions = require('js/actions/window/notes');

var NotesWindowStore = Reflux.createStore({
    getInitialState: function() {
        return false;
    },
    mixins: [Window],
    listenables: NotesActions
});

module.exports = NotesWindowStore;
