'use strict';

var dao                 = require('js/dao');
var EmpireRPCActions    = require('js/actions/rpc/empire');

function makeEmpireCall(options) {
        dao.makeServerCall('empire', options, EmpireRPCActions);
}

EmpireRPCActions.requestEmpireRPCLogout.listen(function(o) {
    makeEmpireCall({
        method  : 'logout',
        params  : [],
        success : 'successEmpireRPCLogout',
        error   : 'failureEmpireRPCLogout' 
    });
});

EmpireRPCActions.requestEmpireRPCViewBoosts.listen(function(o) {
    makeEmpireCall({
        method  : 'view_boosts',
        params  : [],
        success : 'successEmpireRPCViewBoosts',
        error   : 'failureEmpireRPCViewBoosts' 
    });
});

EmpireRPCActions.requestEmpireRPCBoost.listen(function(o) {
    var method = 'boost_' + o.type;

    makeEmpireCall({
        method  : method,
        params  : [o.weeks],
        success : 'successEmpireRPCBoost',
        error   : 'failureEmpireRPCBoost'
    });

});

module.exports = EmpireRPCActions;

