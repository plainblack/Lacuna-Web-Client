'use strict';

var Reflux = require('reflux');

var EssentiaActions = Reflux.createActions([
    'load',
    'show',
    'hide',
    'boost',
    'redeemCode'
]);

module.exports = EssentiaActions;
