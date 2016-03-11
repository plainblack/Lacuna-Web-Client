'use strict';

module.exports = {

    getData : function() {
        return this.state;
    },

    onEscKey : function() {
        if (this.state.show === true) {
            this.hideWindow();
        }
    }
};
