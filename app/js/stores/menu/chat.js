'use strict';

var Reflux      = require('reflux');

var ChatActions = require('js/actions/menu/chat');

var StatefulStore = require('js/stores/mixins/stateful');

var ChatStore = Reflux.createStore({
    listenables : [
        ChatActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return false;
    },

    onShow : function() {
        this.emit(true);
    },

    onHide : function() {
        this.emit(false);
    }
});

module.exports = ChatStore;
