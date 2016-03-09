'use strict';

var Reflux                  = require('reflux');
var server                  = require('js/server');

var EssentiaWindowActions   = require('js/actions/windows/essentia');

var EssentiaEmpireRPCStore = Reflux.createStore({
    listenables : [
        EssentiaWindowActions
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

module.exports = EssentiaEmpireRPCStore;
