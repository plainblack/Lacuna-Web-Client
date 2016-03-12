'use strict';

var Reflux  = require('reflux');
var Server  = require('js/server');
var _       = require('lodash');

var CaptchaRPCActions = Reflux.createActions([
    'requestCaptchaRPCFetch',
    'successCaptchaRPCFetch',
    'failureCaptchaRPCFetch',

    'requestCaptchaRPCSolve',
    'successCaptchaRPCSolve',
    'failureCaptchaRPCSolve'

]);

function requestCaptchaCall(options) {
    var defaults = {
        module  : 'captcha',
        params  : [],
        success : 'noop',
        error   : 'noop'
    };
    options = _.merge({}, defaults, options || {});

    Server.call({
        module  : options.module,
        method  : options.method,
        params  : options.params,
        success : function(result) {
            console.log('CaptchaRPCActions: ' + options.method + '_success');
            // TODO save the status in a common store
            if (typeof result.status !== 'undefined') {
                // var status = _.cloneDeep(result.status);
            }

            // Don't encumber the stores with multiple copies of the status
            delete result.status;
            CaptchaRPCActions[options.success](result);
        },
        error : function(error) {
            console.log('CaptchaRPCActions: ' + options.method + '_error');
            CaptchaRPCActions[options.error](error);
        }
    });
}

CaptchaRPCActions.requestCaptchaRPCFetch.listen(function(o) {
    requestCaptchaCall({
        method : 'fetch',
        params : [],
        success : 'successCaptchaRPCFetch',
        error   : 'failureCaptchaRPCFetch'
    });
});

CaptchaRPCActions.requestCaptchaRPCSolve.listen(function(o) {
    requestCaptchaCall({
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
