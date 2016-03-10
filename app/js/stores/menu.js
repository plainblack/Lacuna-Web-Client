'use strict';

var Reflux      = require('reflux');

var WindowMixinStore    = require('js/stores/mixins/window');

var MenuActions = require('js/actions/menu');
var UserActions = require('js/actions/user');

var MenuStore = Reflux.createStore({
    mixins      : [WindowMixinStore],
    listenables : [MenuActions, UserActions],

    getDefaultData : function() {
        return {
            show : false
        };
    },

    getData : function() {
        return this.state;
    },

    getInitialState : function() {
        if (! this.state) {
            this.state = this.getDefaultData();
        }
        return this.state;
    },

    init : function() {
        this.state = this.getDefaultData();
    },

    show : function(show) {
        this.state.show = show;
        this.trigger(this.state);
    },

    onMenuShow : function() {
        this.show(true);
    },

    onMenuHide : function() {
        this.show(false);
    },

    onSuccessRpcEmpireLogout : function() {
        this.show(false);
    },
});


module.exports = MenuStore;
