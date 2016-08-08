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

    init : function() {
        this.state = this.getInitialState();
    },

    getInitialState : function() {
        return {
            show :  false
        };
    },

    getDefaultData : function() {
        return this.getInitialState();
    },

    onChatShow : function() {
        this.state.show = true;
        this.trigger(this.state);
    },

    onChatHide : function() {
        this.state.show = false;
        this.trigger(this.state);
    },

    onUserSignIn : function() {
        this.onChatShow();
    },

    onSuccessEmpireRPCLogout : function() {
        this.onChatHide();
    }
});

module.exports = ChatStore;
