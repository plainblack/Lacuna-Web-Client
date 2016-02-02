'use strict';

var Reflux = require('reflux');
var $ = require('js/shims/jquery');

var RightSidebarActions = require('js/actions/menu/rightSidebar');

var RightSidebarStore = Reflux.createStore({
    listenables: RightSidebarActions,

    getInitialState: function() {
        return false;
    },

    onShow: function() {
        console.log('Showing right sidebar');
        this.trigger(true);
    },

    onHide: function() {
        console.log('Hiding right sidebar');
        this.trigger(false);
    }
});

module.exports = RightSidebarStore;
