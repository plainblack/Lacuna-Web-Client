'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var EssentiaActions = require('js/actions/window/essentia');

var EssentiaStore = Reflux.createStore({
    mixins: [Window],
    listenables: EssentiaActions
});

module.exports = EssentiaStore;
