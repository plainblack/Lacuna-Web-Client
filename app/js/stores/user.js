'use strict';

var Reflux = require('reflux');

var ChatActions = require('js/actions/menu/chat');
var MenuActions = require('js/actions/window/menu');
var SessionActions = require('js/actions/session');
var StatusActions = require('js/actions/status');
var TickerActions = require('js/actions/ticker');
var UserActions = require('js/actions/user');

var UserStore = Reflux.createStore({
    listenables: UserActions,

    getInitialState: function() {
        return {
            name: '',
            password: ''
        };
    },

    onSignIn: function() {
        MenuActions.show();
        TickerActions.start();
        ChatActions.show();
    },

    onSignOut: function() {

        var Lacuna = YAHOO.lacuna;
        var Game = Lacuna.Game;

        Game.Services.Empire.logout({
            session_id: Game.GetSession()
        }, {
            success: function(o) {

                // Here be the traditional code to reset the game...
                Game.Reset();
                Game.DoLogin();

                // Let the React stuff know what happened.
                SessionActions.clear();
                StatusActions.clear();
                MenuActions.hide();
                TickerActions.stop();
                ChatActions.hide();
            }
        });

        this.trigger(this.getInitialState());
    }
});

module.exports = UserStore;
