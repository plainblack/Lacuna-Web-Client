'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var NotesActions = require('js/actions/window/notes');
var KeyboardActions = require('js/actions/keyboard');

var NotesWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: [NotesActions, KeyboardActions]
});

module.exports = NotesWindowStore;
