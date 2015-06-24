'use strict';

var Reflux = require('reflux');

var Window = require('js/stores/mixins/window');

var EssentiaActions = require('js/actions/window/essentia');

var EssentiaWindowStore = Reflux.createStore({
    mixins: [Window],
    listenables: EssentiaActions,

    getInitialState: function() {
        this.data = false;
        return this.data;
    }
});

module.exports = EssentiaWindowStore;
