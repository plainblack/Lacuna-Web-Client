'use strict';

module.exports = {
    init: function() {
        this.data = undefined;
    },

    getData: function() {
        return this.data;
    },

    onShow: function() {
        console.log('Window show triggered.');
        this.data = true;
        this.trigger(true);
    },

    onHide: function() {
        console.log('Window hide triggered.');
        this.data = false;
        this.trigger(false);
    }
};
