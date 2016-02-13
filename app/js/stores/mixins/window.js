'use strict';

module.exports = {
    init : function() {
        this.data = this.getInitialState();
    },

    getInitialState : function() {
        return false;
    },

    getData : function() {
        return this.data;
    },

    onShow : function() {
        console.log('Window show triggered.');
        this.data = true;
        this.trigger(this.data);
    },

    onHide : function() {
        console.log('Window hide triggered.');
        this.data = false;
        this.trigger(this.data);
    },

    onEscKey : function() {
        if (this.data === true) {
            console.log('Escape key hit.');
            this.onHide();
        }
    }
};
