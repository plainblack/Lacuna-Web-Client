'use strict';

var Reflux = require('reflux');

var ChatActions = Reflux.createActions([
    'chatShow',
    'chatHide'
]);

module.exports = ChatActions;
