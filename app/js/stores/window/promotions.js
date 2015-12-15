'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var PromotionsActions = require('js/actions/window/promotions');
var KeyboardActions = require('js/actions/keyboard');

var PromotionsWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: [PromotionsActions, KeyboardActions]
});

module.exports = PromotionsWindowStore;
