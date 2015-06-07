'use strict';

var Reflux = require('reflux');
var $ = require('js/hacks/jquery');

var RightSidebarActions = require('js/actions/menu/rightSidebar');

var RightSidebarStore = Reflux.createStore({
    listenables: RightSidebarActions,
    onToggle: function() {
        console.log('Toggling right sidebar.');
        $('.ui.sidebar.right').sidebar('toggle');
    }
});

module.exports = RightSidebarStore;
