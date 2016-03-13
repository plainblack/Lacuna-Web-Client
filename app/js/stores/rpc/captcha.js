'use strict';

var Reflux                  = require('reflux');
var StatefulMixinStore      = require('js/stores/mixins/stateful');

var CaptchaWindowActions    = require('js/actions/windows/captcha');
var CaptchaRPCActions       = require('js/actions/rpc/captcha');
var WindowManagerActions    = require('js/actions/windowManager');

var server                  = require('js/server');
var clone                   = require('js/util').clone;

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
            guid    : '',
            url     : '',
            solved  : 0
        };
    },

    onCaptchaWindowClear : function() {
        this.emit(this.getDefaultData());
    },

    onSuccessCaptchaRPCFetch : function(result) {
        var update = clone(this.state);
        update.guid = result.guid;
        update.url  = result.url;

        this.emit(update);
    },

    onSuccessCaptchaRPCSolve : function(result) {
        var update = clone(this.state);
        update.solved = 1;

        this.emit(update);
        WindowManagerActions.hideWindow('CAPTCHA');
    },

    onCaptchaWindowRefresh : function() {
        this.onCaptchaWindowClear();
    }
});

module.exports = CaptchaRPCStore;
