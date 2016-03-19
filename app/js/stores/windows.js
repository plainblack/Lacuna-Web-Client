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

    // We only allow one window of each type (e.g. 'about' or 'building')
    onWindowAdd : function(window, type, options) {
        var state = _.cloneDeep(this.state);
        // First see if there is an existing window type
        var index = _.findIndex(state.windows, function(o) {
            if (o) {
                return o.type === type;
            }
            return false;
        });
        // If not found, then create another row
        if (index < 0) {
            index = state.index;
            state.index = state.index + 1;
        }
        // Otherwise re-use the existing window type
        // (e.g. 'building')
        state.windows[index] = {
            window  : window,
            type    : type,
            options : options
        };
        this.emit(state);
    },

    onWindowClose : function(window) {
        console.log('onWindowClose');
        var state = _.cloneDeep(this.state);
        var index = _.findIndex(state.windows, function(o) { 
            if (o) {
                return o.window === window;
            }
            return false;
        });
        state.windows[index] = null;
        this.emit(state);
    }

});

module.exports = WindowsStore;
