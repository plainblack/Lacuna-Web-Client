'use strict';

var Reflux  = require('reflux');

var CaptchaRPCActions = Reflux.createActions([
    'requestCaptchaRPCFetch',
    'successCaptchaRPCFetch',
    'failureCaptchaRPCFetch',

    'requestCaptchaRPCSolve',
    'successCaptchaRPCSolve',
    'failureCaptchaRPCSolve'

]);

module.exports = CaptchaRPCActions;
