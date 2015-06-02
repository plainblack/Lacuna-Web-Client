'use strict';

module.exports = {
    onShow: function() {
        console.log('Window show triggered.');
        this.trigger(true);
    },

    onHide: function() {
        console.log('Window hide triggered.');
        this.trigger(false);
    }
};
