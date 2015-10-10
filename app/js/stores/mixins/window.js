'use strict';

module.exports = {
    init: function() {
        this.data = this.getInitialState ? this.getInitialState() : false;
    },

    getData: function() {
        return this.data;
    },

    onShow: function() {
        console.log('Window show triggered.');
        this.data = true;
        this.trigger(this.data);
    },

    onHide: function() {
        console.log('Window hide triggered.');
        this.data = false;
        this.trigger(this.data);
    }
};
