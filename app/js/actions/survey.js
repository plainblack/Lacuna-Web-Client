'use strict';

var Reflux = require('reflux');

var SurveyActions = Reflux.createActions([
    'surveyUpdateChoice',
    'surveyUpdateComment'
]);

module.exports = SurveyActions;
