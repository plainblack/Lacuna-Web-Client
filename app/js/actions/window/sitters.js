'use strict';

var Reflux = require('reflux');

var SittersActions = Reflux.createActions([
    'load',
    'show',
    'hide',

    'authorizeAllies',
    'authorizeAlliance',

    'authorizeEmpire',
    'deauthorizeEmpire',

    'reauthorizeAll'
]);

module.exports = SittersActions;
