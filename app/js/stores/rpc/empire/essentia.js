'use strict';

var Reflux          = require('reflux');

var EssentiaActions = require('js/actions/windows/essentia');

var server          = require('js/server');

var EssentiaRPCStore = Reflux.createStore({
    listenables : [
        EssentiaActions
    ],

    onRedeemCode : function(code) {
        server.call({
            module  : 'empire',
            method  : 'redeem_essentia_code',
            params  : [code],
            scope   : this,
            success : function(result) {
                window.alert('Successfully redeemed ' + result.amount + ' Essentia.');
            }
        });
    }
});

module.exports = EssentiaRPCStore;
