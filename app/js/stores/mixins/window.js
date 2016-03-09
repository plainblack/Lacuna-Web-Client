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

    onEscKey : function() {
        if (this.data === true) {
            console.log('Escape key hit.');
            this.onHide();
        }
    }
};
