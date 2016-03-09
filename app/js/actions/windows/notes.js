'use strict';

var Reflux = require('reflux');

var NotesWindowActions = Reflux.createActions([
    'notesWindowShow',
    'notesWindowHide',
    'notesWindowLoad',
    'notesWindowClear',
    'notesWindowSet'
]);

module.exports = NotesWindowActions;
