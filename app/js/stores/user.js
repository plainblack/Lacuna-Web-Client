'use strict';

var Reflux               = require('reflux');
var ReactTooltip         = require('react-tooltip');

var ChatActions          = require('js/actions/menu/chat');
var MapActions           = require('js/actions/menu/map');
var MenuActions          = require('js/actions/menu');
var TickerActions        = require('js/actions/ticker');
var UserActions          = require('js/actions/user');
var RpcEmpireActions     = require('js/actions/rpc/empire');

var server               = require('js/server');

var UserStore = Reflux.createStore({
    listenables : [UserActions, RpcEmpireActions],

    // TODO the individual stores should subscribe to the onSuccessRpcEmpireLogin
    // action
    onUserSignIn : function() {
        MenuActions.show();
        TickerActions.tickerStart();
        ChatActions.show();

        console.log('Firing up the planet view');
        MapActions.changePlanet(YAHOO.lacuna.Game.EmpireData.home_planet_id);
    },

    onSuccessRpcEmpireLogout : function(o) {
        // Here be the traditional code to reset the game...
        YAHOO.lacuna.Game.Reset();
        YAHOO.lacuna.MapPlanet.Reset();
        YAHOO.lacuna.Game.DoLogin();

        // Let the React stuff know what happened.
        // TODO: These stores should listen to the onSuccessRpcEmpireLogout 
        // themselves rather than have this store fire the actions!
        //
        MenuActions.hide();

        // Hide all our tooltips
        ReactTooltip.hide();
    }

});

module.exports = UserStore;
