'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixin/window');

var EssentiaActions = require('js/actions/window/essentia');

var EssentiaStore = Reflux.createStore({
    mixins: [Window],
    listenables: EssentiaActions
});

module.exports = EssentiaStore;
