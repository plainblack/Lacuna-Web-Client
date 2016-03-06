'use strict';

var Reflux          = require('reflux');
var Server          = require('js/server');
var _               = require('lodash');

var RpcEmpireActions = require('js/actions/rpc/empire');

function makeEmpireCall(options) {
    var defaults = {
        module  : 'empire',
        params  : {},
        success : 'noop',
        error   : 'noop'
    };
    options = _.merge({}, defaults, options || {});

    Server.call({
        module  : options.module,
        method  : options.method,
        params  : options.params,
        success : function(result) {
            console.log('makeEmpireCall: ' + options.method + '_success');
            RpcEmpireActions[options.success](result);
        },
        error : function(error) {
            console.log('makeEmpireCall: ' + options.method + '_error');
            options.error(error);
            RpcEmpireActions[options.error](error);
        }
    });
}

RpcEmpireActions.requestRpcEmpireLogout.listen(function(o) {
    makeEmpireCall({
        method  : 'logout',
        params  : {},
        success : 'successRpcEmpireLogout',
        error   : 'failureRpcEmpireLogout' 
    });
});

module.exports = RpcEmpireActions;
