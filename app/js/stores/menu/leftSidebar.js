'use strict';

var Reflux = require('reflux');
var $ = require('js/hacks/jquery');

var LeftSidebarActions = require('js/actions/menu/leftSidebar');

var LeftSidebarStore = Reflux.createStore({
    listenables: LeftSidebarActions,
    onToggle: function() {
        console.log('Toggling left sidebar.');
        $('.ui.sidebar.left')
            .sidebar('setting', 'transition', 'overlay')
            .sidebar('setting', 'duration', 300)
            .sidebar('toggle');
    }
});

module.exports = LeftSidebarStore;
