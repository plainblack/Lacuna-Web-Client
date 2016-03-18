'use strict';

var Reflux  = require('reflux');

var EssentiaVeinRPCActions = Reflux.createActions([
    'requestEssentiaVeinRPCView',
    'successEssentiaVeinRPCView',
    'failureEssentiaVeinRPCView',
    'requestEssentiaVeinRPCDrain',
    'successEssentiaVeinRPCDrain',
    'failureEssentiaVeinRPCDrain'
]);

module.exports = EssentiaVeinRPCActions;
