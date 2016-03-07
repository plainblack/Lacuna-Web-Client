'use strict';

var Reflux = require('reflux');

var RightSidebarActions = Reflux.createActions([
    'rightSidebarShow',
    'rightSidebarHide',
    'rightSidebarCollapse',
    'rightSidebarExpand'
]);

module.exports = RightSidebarActions;
