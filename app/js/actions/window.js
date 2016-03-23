'use strict';

var Reflux = require('reflux');

var WindowActions = Reflux.createActions([
    'windowAdd',
    'windowClose',
    'windowCloseByType'
]);

module.exports = WindowActions;

