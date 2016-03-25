'use strict';

var Reflux  = require('reflux');

var PoliticsTrainingRPCActions = Reflux.createActions([
    'requestPoliticsTrainingRPCView',
    'successPoliticsTrainingRPCView',
    'failurePoliticsTrainingRPCView',
]);

module.exports = PoliticsTrainingRPCActions;
