'use strict';

var Reflux = require('reflux');

var SessionActions = Reflux.createActions([
    'set',
    'clear'
]);

module.exports = SessionActions;
