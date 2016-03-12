'use strict';

var Reflux          = require('reflux');
var Server          = require('js/server');
var _               = require('lodash');

var RPCEmpireActions = require('js/actions/rpc/empire');

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
            RPCEmpireActions[options.success](result);
        },
        error : function(error) {
            console.log('makeEmpireCall: ' + options.method + '_error');
            options.error(error);
            RPCEmpireActions[options.error](error);
        }
    });
}

RPCEmpireActions.requestRPCEmpireLogout.listen(function(o) {
    makeEmpireCall({
        method  : 'logout',
        params  : [],
        success : 'successRPCEmpireLogout',
        error   : 'failureRPCEmpireLogout' 
    });
});

RPCEmpireActions.requestRPCEmpireBoost.listen(function(o) {
    var method = 'boost_' + o.type;

    makeEmpireCall({
        method  : method,
        params  : [o.weeks],
        success : 'successRPCEmpireBoost',
        error   : 'failureRPCEmpireBoost'
    });

});

module.exports = RPCEmpireActions;

