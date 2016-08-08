'use strict';

var Reflux              = require('reflux');

var StatefulMixinStore  = require('js/stores/mixins/stateful');

var EmpireRPCActions    = require('js/actions/rpc/empire');
var SurveyActions       = require('js/actions/survey');

var SurveyRPCStore = Reflux.createStore({

    listenables : [
        EmpireRPCActions,
        SurveyActions
    ],

    mixins : [
        StatefulMixinStore
    ],

    getDefaultData : function() {
        return {
            choice :    -1,
            comment :   "this is a test"
        };
    },
    onSurveyUpdateChoice : function(choice) {
        var state       = this.state;
        state.choice    = choice * 1;
        this.emit(state);
    },
    onSurveyUpdateComment : function(comment) {
        var state       = this.state;
        state.comment   = comment;
        this.emit(state);
    },

    onSuccessEmpireRPCGetSurvey : function(result) {
        var state       = this.state;
        state.choice    = result.survey.choice * 1;
        state.comment   = result.survey.comment;
        this.emit(state);
    }
});

module.exports = SurveyRPCStore;
