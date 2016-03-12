'use strict';

var Reflux                  = require('reflux');
var StatefulMixinStore      = require('js/stores/mixins/stateful');

var CaptchaWindowActions    = require('js/actions/windows/captcha');
var CaptchaRPCActions       = require('js/actions/rpc/captcha');

var server                  = require('js/server');

var CaptchaRPCStore = Reflux.createStore({
    listenables : [
        CaptchaWindowActions,
        CaptchaRPCActions
    ],

    mixins : [
        StatefulMixinStore
    ],

    getDefaultData : function() {
        return {
            guid : '',
            url  : ''
        };
    },

    onCaptchaWindowClear : function() {
        this.emit(this.getDefaultData());
    },

    onSuccessCaptchaRPCFetch : function(result) {
        this.emit(result);
    },

    onSuccessCaptchaRPCSolve : function(result) {
        console.log('onSuccessCaptchaRPCSolve');
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
                this.onCaptchaWindewRefresh();
            },
            scope : this
        });
    },

    onCaptchaWindowRefresh : function() {
        this.onCaptchaWindowClear();
        this.onFetch();
    }
});

module.exports = CaptchaRPCStore;
