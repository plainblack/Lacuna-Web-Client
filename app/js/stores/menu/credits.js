'use strict';

'use strict';

var Reflux = require('reflux');

var Game = YAHOO.lacuna.Game;
var AboutActions = require('js/actions/menu/about');

var CreditsStore = Reflux.createStore({
    listenables: AboutActions,

    onLoad: function() {
        Game.Services.Stats.credits({}, {
            success: function(object) {
                this.trigger(object.result);
            },
            scope: this
        });
    }
});

module.exports = CreditsStore;
