'use strict';

var Reflux = require('reflux');
var _ = require('lodash');

var WindowManagerActions = require('js/actions/menu/windowManager');
var KeyboardActions = require('js/actions/keyboard');

var WindowManagerStore = Reflux.createStore({
    listenables: [
        WindowManagerActions,
        KeyboardActions
    ],

    init: function() {
        this.windows = this.getInitialState();
    },

    getInitialState: function() {
        // TODO: should we persist this state via localStorage?
        return {};
    },

    getTopLayerNumber: function(windows) {
        if (_.keys(windows).length) {
            return _.max(_.pluck(windows, 'layer'));
        } else {
            return 0;
        }
    },

    getNextLayerNumber: function(windows) {
        return this.getTopLayerNumber(windows) + 1;
    },

    isOnTop: function(id) {
        var top = this.getTopLayerNumber(this.windows);

        if (this.windows[id]) {
            return this.windows[id] === top;
        } else {
            return false;
        }
    },

    onAddWindow: function(type, options) {
        var id = 'window_' + type;
        var windows = _.cloneDeep(this.windows);

        windows[id] = {
            id: id,
            type: type,
            show: true,
            options: options,
            layer: this.getNextLayerNumber(windows)
        };

        this.windows = windows;
        this.trigger(this.windows);
    },

    onHideWindow: function(id) {
        var windows = _.cloneDeep(this.windows);

        if (windows[id]) {
            windows[id].show = false;
        }

        this.windows = windows;
        this.trigger(this.windows);
    },

    onHideAllWindows: function() {
        var windows = _.cloneDeep(this.windows);

        windows = _.mapValues(windows, function(win) {
            win.show = false;
            return win;
        });

        this.windows = windows;
        this.trigger(this.windows);
    },

    onBringWindowToTop: function(id) {
        var windows = _.cloneDeep(this.windows);

        if (windows[id]) {
            windows[id].layer = this.getNextLayerNumber(windows);
        }

        this.windows = windows;
        this.trigger(this.windows);
    },

    onEscKey: function() {
        var window = _.chain(_.clone(this.windows))
            .values()
            .filter({show: true})
            .sortBy('layer')
            .reverse()
            .first()
            .value();

        if (window) {
            WindowManagerActions.hideWindow(window.id);
        }
    }
});

module.exports = WindowManagerStore;
