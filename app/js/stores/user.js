'use strict';

var Reflux              = require('reflux');
var ReactTooltip        = require('react-tooltip');

var RpcEmpireActions    = require('js/actions/rpc/empire');
var UserActions         = require('js/actions/user');
var MenuActions         = require('js/actions/menu');
var TickerActions       = require('js/actions/ticker');
var ChatActions         = require('js/actions/menu/chat');
var MapActions          = require('js/actions/menu/map');

var server              = require('js/server');

// TODO What is the purpose of this store? It does not store anything!
// (it should disappear when the yui code is replaced totally)
//
var UserStore = Reflux.createStore({
    listenables : [RpcEmpireActions, UserActions],


    onUserSignIn : function() {
        MenuActions.menuActionShow();
        TickerActions.tickerShow();
        ChatActions.chatShow();
        // TODO This should be possible to be removed. BUT it is needed for 
        // now. It is called in the map store by attaching tothe onUserSignin
        // event (as it does here) but perhaps it requires the other stores
        // to complete first before it works?
        console.log('Firing up the planet view');
        MapActions.mapChangePlanet(YAHOO.lacuna.Game.EmpireData.home_planet_id);
    },

    onSuccessRpcEmpireLogout : function(o) {
        // Here be the traditional code to reset the game...
        YAHOO.lacuna.Game.Reset();
        YAHOO.lacuna.MapPlanet.Reset();
        YAHOO.lacuna.Game.DoLogin();

        // Hide all our tooltips
        ReactTooltip.hide();
    }

});

module.exports = UserStore;
