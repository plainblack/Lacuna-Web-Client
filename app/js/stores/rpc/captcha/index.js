'use strict';

var Reflux = require('reflux');

var CaptchaActions = require('js/actions/window/captcha');

var server = require('js/server');

var CaptchaRPCStore = Reflux.createStore({
    listenables: [
        CaptchaActions
    ],

    init: function() {
        this.data = this.getInitialState();
    },

    getInitialState: function() {
        if (this.data) {
            return this.data;
        } else {
            return {
                guid: '',
                url: ''
            }
        }
    },

    onClear: function() {
        this.data = undefined;
        this.data = this.getInitialState();
        this.trigger(this.data);
    },

    onFetch: function() {
        server.call({
            module: 'captcha',
            method: 'fetch',
            params: [],
            success: function(result) {
                this.data = result;
                this.trigger(this.data);
            },
            scope: this
        });
    },

    onSolve: function(solution, success) {
        server.call({
            module: 'captcha',
            method: 'solve',
            params: [this.data.guid, solution],
            success: function(result) {
                if (typeof success === 'function') {
                    success();
                }
            },
            error: function() {
                CaptchaActions.refresh();
            },
            scope: this
        });
    },

    onRefresh: function() {
        CaptchaActions.clear();
        CaptchaActions.fetch();
    }
});

module.exports = CaptchaRPCStore;
