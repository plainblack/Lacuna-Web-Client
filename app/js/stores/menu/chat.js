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

    onChatShow : function() {
        this.emit(true);
    },

    onChatHide : function() {
        this.emit(false);
    },

    onSuccessRpcEmpireLogout : function() {
        this.emit(false);
    },
});

module.exports = ChatStore;
