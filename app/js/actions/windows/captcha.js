'use strict';

var Reflux = require('reflux');

var CaptchaActions = Reflux.createActions([
    'clear',
    'fetch',
    'refresh',
    'solve'
]);

module.exports = CaptchaActions;
