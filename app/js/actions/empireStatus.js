'use strict';

var Reflux = require('reflux');

var EmpireStatusActions = Reflux.createActions([
    'empireStatusUpdate',
    'empireStatusClear'
]);

module.exports = EmpireStatusActions;
