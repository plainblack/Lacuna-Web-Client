'use strict';

var Reflux              = require('reflux');

var StatefulMixinStore  = require('js/stores/mixins/stateful');

var EmpireRPCActions     = require('js/actions/rpc/empire');

var InviteRPCStore = Reflux.createStore({

    listenables : [
        EmpireRPCActions
    ],

    mixins : [
        StatefulMixinStore
    ],

    getDefaultData : function() {
        return {
            referral_url : ""
        };
    },

    onSuccessEmpireRPCGetInviteFriendUrl : function(result) {
        var state = this.getDefaultData();

        state.referral_url = result.referral_url;
        this.emit(state);
    }
});

module.exports = InviteRPCStore;
