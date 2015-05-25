'use strict';

var Reflux = require('reflux');

var AboutActions = Reflux.createActions([
    'load',
    'open',
    'close'
]);

module.exports = AboutActions;
