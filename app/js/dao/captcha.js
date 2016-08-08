'use strict';

var Reflux              = require('reflux');
var Server              = require('js/server');
var _                   = require('lodash');

var CaptchaRPCActions   = require('js/actions/rpc/captcha');

var dao                 = require('js/dao');

function makeCaptchaCall(options) {
    dao.makeServerCall('captcha', options, CaptchaRPCActions);
}

CaptchaRPCActions.requestCaptchaRPCFetch.listen(function(o) {
    makeCaptchaCall({
        method : 'fetch',
        params : [],
        success : 'successCaptchaRPCFetch',
        error   : 'failureCaptchaRPCFetch'
    });
});

CaptchaRPCActions.requestCaptchaRPCSolve.listen(function(o) {
    makeCaptchaCall({
        method : 'solve',
        params : [
            o.guid,
            o.solution
        ],
        success : 'successCaptchaRPCSolve',
        error   : 'failureCaptchaRPCSolve'
    });
});

module.exports = CaptchaRPCActions;

