'use strict';

var Reflux            = require('reflux');

var LoaderMenuActions = require('js/actions/menu/loader');

var LoaderMenuStore = Reflux.createStore({
    listenables : LoaderMenuActions,

    init : function() {
        this.state = this.getInitialState();
    },

    getInitialState : function() {
        return {
            show :  false
        };
    },
    // Deprecated
    onShow : function() {
        this.onLoaderMenuShow();
    },
    // Deprecated
    onHide : function() {
        this.onLoaderMenuHide();
    },

    onLoaderMenuShow : function() {
        this.state.show = true;
        this.trigger(this.state);
    },

    onLoaderMenuHide : function() {
        this.state.show = false;
        this.trigger(this.state);
    }

});

module.exports = LoaderMenuStore;
