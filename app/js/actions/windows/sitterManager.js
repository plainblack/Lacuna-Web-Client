'use strict';

var Reflux = require('reflux');

var SitterManagerActions = Reflux.createActions([
    'load',

    'authorizeAllies',
    'authorizeAlliance',

    'authorizeEmpire',
    'deauthorizeEmpire',

    'reauthorizeAll',
    'deauthorizeAll'
]);

module.exports = SitterManagerActions;
