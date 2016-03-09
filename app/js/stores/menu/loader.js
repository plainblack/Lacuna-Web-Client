'use strict';

var Reflux            = require('reflux');

var LoaderMenuActions = require('js/actions/menu/loader');

var WindowMixinStore  = require('js/stores/mixins/window');

var LoaderMenuStore = Reflux.createStore({
    listenables : LoaderMenuActions,
    mixins      : [WindowMixinStore],

    onLoaderShow : function() {
        this.data = true;
        this.trigger(this.data);
    },

    onLoaderHide : function() {
        this.data = false;
        this.trigger(this.data);
    }

});

module.exports = LoaderMenuStore;
