'use strict';

var Reflux = require('reflux');

var NotesActions = Reflux.createActions([
    'show',
    'hide',
    'notesLoad',
    'notesClear',
    'notesSet'
]);

module.exports = NotesActions;
