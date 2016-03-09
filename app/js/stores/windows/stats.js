'use strict';

var Reflux              = require('reflux');

var WindowMixinStore    = require('js/stores/mixins/window');

var StatsWindowActions  = require('js/actions/windows/stats');
var KeyboardActions     = require('js/actions/keyboard');

var StatsWindowStore = Reflux.createStore({
    mixins      : [WindowMixinStore],
    listenables : [StatsWindowActions, KeyboardActions],

    onStatsWindowShow : function() {
        this.data = true;
        this.trigger(this.data);
    },

    onStatsWindowHide : function() {
        this.data = false;
        this.trigger(this.data);
    }

});

module.exports = StatsWindowStore;
