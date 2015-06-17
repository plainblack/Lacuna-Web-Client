'use strict';

var Reflux = require('reflux');

var ChatActions = require('js/actions/menu/chat');
var MenuActions = require('js/actions/window/menu');
var StatusActions = require('js/actions/status');
var TickerActions = require('js/actions/ticker');
var UserActions = require('js/actions/user');

var EmpireStore = Reflux.createStore({
    listenables: UserActions,

    getInitialState: function() {
        return {
            name: '',
            password: ''
        };
    },

    onSignIn: function(obj) {
        MenuActions.show();
        TickerActions.start();
        ChatActions.show();
        this.trigger(obj);
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
                StatusActions.clear();
                MenuActions.hide();
                TickerActions.stop();
            }
        });

        this.trigger(this.getInitialState());
    }
});

module.exports = EmpireStore;
