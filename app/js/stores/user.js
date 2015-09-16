'use strict';

var Reflux = require('reflux');

var ChatActions = require('js/actions/menu/chat');
var MenuActions = require('js/actions/menu');
var SessionActions = require('js/actions/session');
var StatusActions = require('js/actions/status');
var TickerActions = require('js/actions/ticker');
var UserActions = require('js/actions/user');
var SessionStore = require('js/stores/session');

var server = require('js/server');

var UserStore = Reflux.createStore({
    listenables: UserActions,

    onSignIn: function() {
        MenuActions.show();
        TickerActions.start();
        ChatActions.show();
    },

    onSignOut: function() {
        server.call({
            module: 'empire',
            method: 'logout',
            params: [SessionStore.getData()],
            success: function() {
                // Here be the traditional code to reset the game...
                YAHOO.lacuna.Game.Reset();
                YAHOO.lacuna.MapPlanet.Reset();
                YAHOO.lacuna.Game.DoLogin();

                // Let the React stuff know what happened.
                SessionActions.clear();
                StatusActions.clear();
                MenuActions.hide();
                TickerActions.stop();
                ChatActions.hide();
            }
        });
    }
});

module.exports = UserStore;
