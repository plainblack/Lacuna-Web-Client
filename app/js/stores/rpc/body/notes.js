'use strict';

var Reflux = require('reflux');

var NotesActions = require('js/actions/window/notes');

var BodyRPCStore = require('js/stores/rpc/body');

var server = require('js/server');

var NotesDataStore = Reflux.createStore({
    listenables: NotesActions,

    onLoad: function() {
        this.trigger(BodyRPCStore.getData().notes);
    },

    onSave: function(value) {
        server.call({
            module: 'body',
            method: 'set_colony_notes',
            trigger: false,
            params: [
                BodyRPCStore.getData().id,
                {
                    notes: value
                }
            ],
            scope: this
        });
    }
});

module.exports = NotesDataStore;
