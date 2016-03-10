'use strict';

var Reflux = require('reflux');

var LoaderMenuActions = Reflux.createActions([
    'loaderMenuShow',
    'loaderMenuHide',
    // The following are deprecated...
    'show',
    'hide'
]);

module.exports = LoaderMenuActions;
