'use strict';

var Reflux              = require('reflux');

var RightSidebarActions = require('js/actions/menu/rightSidebar');

var StatefulStore       = require('js/stores/mixins/stateful');

var RightSidebarStore = Reflux.createStore({
    listenables : [
        RightSidebarActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return false;
    },

    onRightSidebarShow : function() {
        console.log('Showing right sidebar');
        this.emit(true);
    },

    onRightSidebarHide : function() {
        console.log('Hiding right sidebar');
        this.emit(false);
    }
});

module.exports = RightSidebarStore;
