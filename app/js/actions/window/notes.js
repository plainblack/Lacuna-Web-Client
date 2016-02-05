'use strict';

var Reflux = require('reflux');

var NotesActions = Reflux.createActions([
    'show',
    'hide',

    'load',
    'clear',
    'set',
    'save'
]);

module.exports = NotesActions;
