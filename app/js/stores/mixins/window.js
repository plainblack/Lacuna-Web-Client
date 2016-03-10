'use strict';

module.exports = {

    getData : function() {
        return this.data;
    },

    onEscKey : function() {
        if (this.data.show === true) {
            this.hideWindow();
        }
    }
};
