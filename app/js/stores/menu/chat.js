'use strict';

var Reflux          = require('reflux');

var ChatActions     = require('js/actions/menu/chat');
var UserActions     = require('js/actions/user');
var StatefulStore   = require('js/stores/mixins/stateful');

var ChatStore = Reflux.createStore({
    listenables : [
        ChatActions,
        UserActions
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

    onUserSignIn : function() {
        this.onChatShow();
    },

    onChatHide : function() {
        this.emit(false);
    },

    onSuccessRpcEmpireLogout : function() {
        this.onChatHide();
    },
});

module.exports = ChatStore;
