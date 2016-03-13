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
            windows : []
        };
    },

    onWindowAdd : function(window) {
        var state = _.cloneDeep(this.state);
        state.windows = _.concat(state.windows, window);
        this.emit(state);
    },

    onWindowClose : function(window) {
        console.log('onWindowClose');
        var state = _.cloneDeep(this.state);
        state.windows = _.remove(state.windows, function(value) {
            value === window;
        });
        this.emit(state);
    }

});

module.exports = WindowsStore;
