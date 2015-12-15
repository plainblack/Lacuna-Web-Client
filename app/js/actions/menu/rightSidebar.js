'use strict';

var Reflux = require('reflux');

var RightSidebarActions = Reflux.createActions([
    'toggle',
    'collapseAccordion',
    'expandAccordion'
]);

module.exports = RightSidebarActions;
