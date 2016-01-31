'use strict';

var Reflux = require('reflux');

var UserActions = Reflux.createActions([
    'userSignIn',
    'userSignOut'
]);

module.exports = UserActions;
