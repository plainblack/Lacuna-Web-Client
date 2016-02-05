'use strict';

var Reflux = require('reflux');

var UserActions = Reflux.createActions([
    'signIn',
    'signOut'
]);

module.exports = UserActions;
