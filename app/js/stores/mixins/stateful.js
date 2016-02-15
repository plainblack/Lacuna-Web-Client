'use strict';

var StatefulStore = {
    getDefaultData : function() {
        return {};
    },

    getData : function() {
        return this.state;
    },

    getInitialState : function() {
        if (this.state) {
            return this.state;
        } else {
            return this.getDefaultData();
        }
    },

    init : function() {
        this.state = this.getDefaultData();
    },

    setState : function(newState) {
        this.state = newState;
    },

    emit : function(newState) {
        var oldStateStr = JSON.stringify(this.state);
        var newStateStr = JSON.stringify(newState);

        if (oldStateStr !== newStateStr) {
            this.setState(newState);
            this.trigger(this.state);
        }
    }
};

module.exports = StatefulStore;
