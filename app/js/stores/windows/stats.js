'use strict';

var Reflux              = require('reflux');

var WindowMixinStore    = require('js/stores/mixins/window');

var StatsWindowActions  = require('js/actions/windows/stats');
var KeyboardActions     = require('js/actions/keyboard');

var StatsWindowStore = Reflux.createStore({
    mixins      : [WindowMixinStore],
    listenables : [StatsWindowActions, KeyboardActions],

    getDefaultData : function() {
        return {
            show : false
        };
    },

    getData : function() {
        return this.state;
    },

    getInitialState : function() {
        if (this.state) {
            return this.state;
        } else {
            return this.getDefaultData();
        }
    },

    init : function() {
        this.state = this.getDefaultData();
    },

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
