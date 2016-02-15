'use strict';

var Reflux         = require('reflux');
var StatefulStore  = require('js/stores/mixins/stateful');

var CaptchaActions = require('js/actions/windows/captcha');

var server         = require('js/server');

var CaptchaRPCStore = Reflux.createStore({
    listenables : [
        CaptchaActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return {
            guid : '',
            url  : ''
        };
    },

    onClear : function() {
        this.emit(this.getDefaultData());
    },

    onFetch : function() {
        server.call({
            module  : 'captcha',
            method  : 'fetch',
            params  : [],
            success : function(result) {
                this.emit(result);
            },
            scope : this
        });
    },

    onSolve : function(solution, success) {
        server.call({
            module : 'captcha',
            method : 'solve',
            params : [
                this.state.guid,
                solution
            ],
            success : function(result) {
                if (typeof success === 'function') {
                    success();
                }
            },
            error : function() {
                CaptchaActions.refresh();
            },
            scope : this
        });
    },

    onRefresh : function() {
        CaptchaActions.clear();
        CaptchaActions.fetch();
    }
});

module.exports = CaptchaRPCStore;
