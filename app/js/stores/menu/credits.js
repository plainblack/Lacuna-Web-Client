'use strict';

var Reflux = require('reflux');

var AboutActions = require('js/actions/window/about');

var CreditsStore = Reflux.createStore({
    listenables: AboutActions,

    onLoad: function() {
        YAHOO.lacuna.Game.Services.Stats.credits({}, {
            success: function(object) {
                this.trigger(object.result);
            },
            scope: this
        });
    }
});

module.exports = CreditsStore;
