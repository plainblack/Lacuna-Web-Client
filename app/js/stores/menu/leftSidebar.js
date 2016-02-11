'use strict';

var Reflux             = require('reflux');

var LeftSidebarActions = require('js/actions/menu/leftSidebar');

var LeftSidebarStore = Reflux.createStore({
    listenables : LeftSidebarActions,

    getInitialState : function() {
        return false;
    },

    onShow : function() {
        console.log('Showing left sidebar');
        this.trigger(true);
    },

    onHide : function() {
        console.log('Hiding left sidebar');
        this.trigger(false);
    }

});

module.exports = LeftSidebarStore;
