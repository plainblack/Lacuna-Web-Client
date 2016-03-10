'use strict';

var Reflux            = require('reflux');

var LoaderMenuActions = require('js/actions/menu/loader');

var LoaderMenuStore = Reflux.createStore({
    listenables : LoaderMenuActions,

    init : function() {
        this.data = this.getInitialState();
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
        this.data.show = true;
        this.trigger(this.data);
    },

    onLoaderMenuHide : function() {
        this.data.show = false;
        this.trigger(this.data);
    }

});

module.exports = LoaderMenuStore;
