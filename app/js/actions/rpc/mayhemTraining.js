'use strict';

var Reflux  = require('reflux');

var MayhemTrainingRPCActions = Reflux.createActions([
    'requestMayhemTrainingRPCView',
    'successMayhemTrainingRPCView',
    'failureMayhemTrainingRPCView',
]);

module.exports = MayhemTrainingRPCActions;
