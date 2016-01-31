'use strict';

var Reflux = require('reflux');

var BodyStatusActions = Reflux.createActions([
    'bodyStatusUpdate',
    'bodyStatusClear'
]);

module.exports = BodyStatusActions;
