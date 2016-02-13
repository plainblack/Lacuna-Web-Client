'use strict';

var Reflux = require('reflux');

var SessionActions = Reflux.createActions([
    'sessionSet',
    'sessionClear'
]);

module.exports = SessionActions;
