'use strict';

var Reflux = require('reflux');

var NotesActions = Reflux.createActions([
    'show',
    'hide',

    'load',
    'save'
]);

module.exports = NotesActions;
