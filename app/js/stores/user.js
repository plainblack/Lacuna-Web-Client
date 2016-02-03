'use strict';

var Reflux = require('reflux');

var ChatActions         = require('js/actions/menu/chat');
var MenuActions         = require('js/actions/menu');
var SessionActions      = require('js/actions/session');
var ServerStatusActions = require('js/actions/serverStatus');
var TickerActions       = require('js/actions/ticker');
var UserActions         = require('js/actions/user');
var SessionStore        = require('js/stores/session');

var server = require('js/server');

var UserStore = Reflux.createStore({
    listenables: UserActions,

    onUserSignIn: function() {
        MenuActions.show();
        TickerActions.tickerStart();
        ChatActions.show();
    },

    onUserSignOut: function() {
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
                SessionActions.sessionClear();
                ServerStatusActions.serverStatusClear();
                MenuActions.hide();
                TickerActions.tickerStop();
                ChatActions.hide();
            }
        });
    }
});

module.exports = UserStore;
