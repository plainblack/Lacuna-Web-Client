'use strict';

var Reflux              = require('reflux');
var _                   = require('lodash');

var StatefulMixinStore  = require('js/stores/mixins/stateful');

var WindowActions       = require('js/actions/window');

var WindowsStore = Reflux.createStore({

    listenables : [
        WindowActions
    ],


    mixins : [
        StatefulMixinStore
    ],

    getDefaultData : function() {
        return {
            windows : [],
            index   : 0
        };
    },

    onWindowAdd : function(window) {
        var state = _.cloneDeep(this.state);
        var index = state.index;
        state.index = state.index + 1;
        state.windows[index] = window;
        this.emit(state);
    },

    onWindowClose : function(window) {
        console.log('onWindowClose');
        var state = _.cloneDeep(this.state);
        var index = _.indexOf(state.windows, window);
        state.windows[index] = null;
        this.emit(state);
    }

});

module.exports = WindowsStore;
