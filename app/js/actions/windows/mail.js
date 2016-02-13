'use strict';

var Reflux = require('reflux');

var MailActions = Reflux.createActions([
    'load',
    'show',
    'hide'
]);

module.exports = MailActions;
