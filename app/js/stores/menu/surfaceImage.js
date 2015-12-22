'use strict';

var Reflux = require('reflux');

var SurfaceImageActions = require('js/actions/menu/surfaceImage');

var SurfaceImageStore = Reflux.createStore({

    listenables: [
        SurfaceImageActions
    ],

    init: function() {
        this.data = this.getInitialState();
    },

    getInitialState: function() {
        // Use the previous image so as to avoid a white background when changing from
        // star map to planet map.
        if (this.data) {
            return this.data;
        }

        return '';
    },

    getData: function() {
        return this.data;
    },

    handleData: function(image) {
        return YAHOO.lacuna.Library.AssetUrl + 'planet_side/' + image + '.jpg'
    },

    onSet: function(image) {
        this.data = this.handleData(image);
        this.trigger(this.data);
    }

});

module.exports = SurfaceImageStore;
