'use strict';

var Reflux = require('reflux');

var RightSidebarActions = Reflux.createActions([
    'show',
    'hide',
    'collapseAccordion',
    'expandAccordion'
]);

module.exports = RightSidebarActions;
