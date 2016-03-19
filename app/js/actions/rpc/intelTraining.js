'use strict';

var Reflux  = require('reflux');

var IntelTrainingRPCActions = Reflux.createActions([
    'requestIntelTrainingRPCView',
    'successIntelTrainingRPCView',
    'failureIntelTrainingRPCView',
]);

module.exports = IntelTrainingRPCActions;
