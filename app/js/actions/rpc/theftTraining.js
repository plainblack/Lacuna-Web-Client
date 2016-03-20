'use strict';

var Reflux  = require('reflux');

var TheftTrainingRPCActions = Reflux.createActions([
    'requestTheftTrainingRPCView',
    'successTheftTrainingRPCView',
    'failureTheftTrainingRPCView',
]);

module.exports = TheftTrainingRPCActions;
