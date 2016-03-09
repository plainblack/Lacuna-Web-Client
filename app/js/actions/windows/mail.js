'use strict';

var Reflux = require('reflux');

var MailActions = Reflux.createActions([
    'mailWindowLoad',
    'mailWindowShow',
    'mailWindowHide'
]);

module.exports = MailActions;
