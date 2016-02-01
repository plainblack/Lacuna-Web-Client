'use strict'

var Reflux = require('reflux');

var WindowManagerActions = Reflux.createActions([
    'addWindow',
    'hideWindow',
    'hideAllWindows',
    'removeWindow',
    'removeAllWindows',
    'bringWindowToTop'
]);

module.exports = WindowManagerActions;
