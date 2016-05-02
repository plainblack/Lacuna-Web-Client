'use strict';

var dao                 = require('js/dao');
var vex                 = require('js/vex');
var EmpireRPCActions    = require('js/actions/rpc/empire');
var WindowActions       = require('js/actions/window');
var SurveyWindow        = require('js/components/window/survey');

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

EmpireRPCActions.requestEmpireRPCGetInviteFriendUrl.listen(function(o) {
    makeEmpireCall({
        method  : 'get_invite_friend_url',
        params  : [],
        success : 'successEmpireRPCGetInviteFriendUrl',
        error   : 'failureEmpireRPCGetInviteFriendUrl'
    });
});

EmpireRPCActions.requestEmpireRPCInviteFriend.listen(function(o) {
    makeEmpireCall({
        method  : 'invite_friend',
        params  : [o.email, o.message],
        success : 'successEmpireRPCInviteFriend',
        error   : 'failureEmpireRPCInviteFriend'
    });
});

EmpireRPCActions.requestEmpireRPCGetSurvey.listen(function(o) {
    makeEmpireCall({
        method  : 'get_survey',
        params  : [],
        success : 'successEmpireRPCGetSurvey',
        error   : 'failureEmpireRPCGetSurvey'
    });
});

EmpireRPCActions.requestEmpireRPCSetSurvey.listen(function(o) {
    makeEmpireCall({
        method  : 'set_survey',
        params  : [o.choice, o.comment],
        success : 'successEmpireRPCSetSurvey',
        error   : 'failureEmpireRPCSetSurvey'
    });
});

EmpireRPCActions.requestEmpireRPCViewAuthorizedSitters.listen(function(o) {
    makeEmpireCall({
        method  : 'view_authorized_sitters',
        params  : [],
        success : 'successEmpireRPCViewAuthorizedSitters',
        error   : 'failureEmpireRPCViewAuthorizedSitters'
    });
});

EmpireRPCActions.requestEmpireRPCAuthorizeSitters.listen(function(o) {
    makeEmpireCall({
        method  : 'authorize_sitters',
        params  : [o],
        success : 'successEmpireRPCAuthorizeSitters',
        error   : 'failureEmpireRPCAuthorizeSitters'
    });
});

EmpireRPCActions.requestEmpireRPCDeauthorizeSitters.listen(function(o) {
    makeEmpireCall({
        method  : 'deauthorize_sitters',
        params  : [o],
        success : 'successEmpireRPCDeauthorizeSitters',
        error   : 'failureEmpireRPCDeauthorizeSitters'
    });
});

EmpireRPCActions.requestEmpireRPCRedeemEssentiaCode.listen(function(o) {
    makeEmpireCall({
        method  : 'redeem_essentia_code',
        params  : [o.code],
        success : 'successEmpireRPCRedeemEssentiaCode',
        error   : 'failureEmpireRPCRedeemEssentiaCode'
    });
});

EmpireRPCActions.requestEmpireRPCEnableSelfDestruct.listen(function(o) {
    makeEmpireCall({
        method  : 'enable_self_destruct',
        params  : [],
        success : 'successEmpireRPCEnableSelfDestruct',
        error   : 'failureEmpireRPCEnableSelfDestruct'
    });
});

EmpireRPCActions.requestEmpireRPCDisableSelfDestruct.listen(function(o) {
    makeEmpireCall({
        method  : 'disable_self_destruct',
        params  : [],
        success : 'successEmpireRPCDisableSelfDestruct',
        error   : 'failureEmpireRPCDisableSelfDestruct'
    });
});

// I'm not sure these belong here. but for now
//

EmpireRPCActions.successEmpireRPCRedeemEssentiaCode.listen(function(result) {
    vex.alert('Successfully redeemed ' + result.amount + ' Essentia.');
});

EmpireRPCActions.successEmpireRPCEnableSelfDestruct.listen(function(result) {
    vex.alert('Success - your empire will be deleted in 24 hours.');
});

EmpireRPCActions.successEmpireRPCDisableSelfDestruct.listen(function(result) {
    vex.alert('Success - your empire will not be deleted. Phew!');
});

EmpireRPCActions.successEmpireRPCInviteFriend.listen(function(result) {
    vex.alert('Success - your friend has been sent an invite email.');
});

EmpireRPCActions.successEmpireRPCGetSurvey.listen(function(result) {
    if (result.survey.choice == 0) {
        vex.alert('Please fill in the survey.');
        WindowActions.windowAdd(SurveyWindow, 'survey'); 
    }
});



module.exports = EmpireRPCActions;

