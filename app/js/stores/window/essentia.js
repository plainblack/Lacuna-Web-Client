'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var EssentiaActions = require('js/actions/window/essentia');
var KeyboardActions = require('js/actions/keyboard');

var EssentiaWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: [EssentiaActions, KeyboardActions]
});

module.exports = EssentiaWindowStore;
