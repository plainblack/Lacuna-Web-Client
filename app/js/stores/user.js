'use strict';

var Reflux = require('reflux');

var UserActions = require('js/actions/user');
var StatusActions = require('js/actions/status');
var MenuActions = require('js/actions/window/menu');

var EmpireStore = Reflux.createStore({
    listenables: UserActions,

    getInitialState: function() {
        return {
            name: '',
            password: ''
        };
    },

    onSignIn: function(obj) {
        // TODO: Do interesting stuff.
        MenuActions.show();
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
            }
        });

        this.trigger(this.getInitialState());
    }
});

module.exports = EmpireStore;
