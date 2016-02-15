'use strict';

var Reflux               = require('reflux');
var _                    = require('lodash');

var WindowManagerActions = require('js/actions/windowManager');
var KeyboardActions      = require('js/actions/keyboard');

var StatefulStore        = require('js/stores/mixins/stateful');
var clone                = require('js/util').clone;

var WindowManagerStore = Reflux.createStore({
    listenables : [
        WindowManagerActions,
        KeyboardActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        // TODO: should we persist this state via localStorage?

        return {};
    },

    getTopLayerNumber : function(windows) {
        if (_.keys(windows).length) {
            return _.max(_.pluck(windows, 'layer'));
        } else {
            return 0;
        }
    },

    getNextLayerNumber : function(windows) {
        return this.getTopLayerNumber(windows) + 1;
    },

    isOnTop : function(id, windows) {
        var top = this.getTopLayerNumber(windows);

        if (this.state[id]) {
            return this.state[id] === top;
        } else {
            return false;
        }
    },

    onAddWindow : function(type, options) {
        var id = 'window_' + type;
        var windows = clone(this.state);

        windows[id] = {
            id      : id,
            type    : type,
            options : options,
            layer   : this.getNextLayerNumber(windows)
        };

        this.emit(windows);
    },

    onHideWindow : function(id) {
        var windows = clone(this.state);
        delete windows[id];
        this.emit(windows);
    },

    onHideAllWindows : function() {
        this.emit({});
    },

    onBringWindowToTop : function(id) {
        if (this.isOnTop(id, this.state)) {
            return;
        }

        var windows = clone(this.state);

        if (windows[id]) {
            windows[id].layer = this.getNextLayerNumber(windows);
        }

        this.emit(windows);
    },

    onEscKey : function() {
        var topWindow = _.chain(clone(this.state))
            .values()
            .sortBy('layer')
            .reverse()
            .first()
            .value();

        if (topWindow) {
            WindowManagerActions.hideWindow(topWindow.id);
        }
    }
});

module.exports = WindowManagerStore;
