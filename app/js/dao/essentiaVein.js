'use strict';

var dao                     = require('js/dao');

var EssentiaVeinRPCActions  = require('js/actions/rpc/essentiaVein');
var BuildingWindowActions   = require('js/actions/windows/building');

function makeEssentiaVeinCall(options) {
    dao.makeServerCall('essentiavein', options, EssentiaVeinRPCActions);
}

EssentiaVeinRPCActions.requestEssentiaVeinRPCView.listen(function(o) {
    makeEssentiaVeinCall({
        method  : 'view',
        params  : [o],
        success : 'successEssentiaVeinRPCView',
        error   : 'failureEssentiaVeinRPCView' 
    });
});
EssentiaVeinRPCActions.successEssentiaVeinRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});


EssentiaVeinRPCActions.requestEssentiaVeinRPCDrain.listen(function(o) {
    makeEssentiaVeinCall({
        method  : 'drain',
        params  : [o.id, o.times],
        success : 'successEssentiaVeinRPCDrain',
        error   : 'failureEssentiaVeinRPCDrain' 
    });
});


