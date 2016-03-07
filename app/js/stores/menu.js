'use strict';

var Reflux      = require('reflux');

var Window      = require('js/stores/mixins/window');

var MenuActions = require('js/actions/menu');
var UserActions = require('js/actions/user');

var MenuStore = Reflux.createStore({
    mixins      : [Window],
    listenables : [MenuActions, UserActions],

    onMenuShow : function() {
        this.showWindow();
    },

    onUserSignIn : function() {
        this.showWindow();
    },

    onMenuHide : function() {
        this.hideWindow();
    },

    onSuccessRpcEmpireLogout : function() {
        this.hideWindow();
    },
});


module.exports = MenuStore;
