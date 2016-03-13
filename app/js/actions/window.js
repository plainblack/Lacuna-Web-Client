'use strict';

var Reflux = require('reflux');

var WindowActions = Reflux.createActions([
    'windowAdd',
    'windowClose'
]);

module.exports = WindowActions;

