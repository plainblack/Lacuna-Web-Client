'use strict';

var Reflux = require('reflux');

var AboutActions = Reflux.createActions([
    'load',
    'show',
    'hide'
]);

module.exports = AboutActions;
