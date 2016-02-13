'use strict';

var Reflux = require('reflux');

var EssentiaActions = Reflux.createActions([
    'loadBoosts',
    'boost',
    'redeemCode'
]);

module.exports = EssentiaActions;
