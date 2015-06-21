'use strict';

var Reflux = require('reflux');

var NotesActions = require('js/actions/window/notes');

var BodyStore = require('js/stores/body');
window.BodyStore = BodyStore;

var server = require('js/server');

var NotesDataStore = Reflux.createStore({
    listenables: NotesActions,

    onLoad: function() {
        this.trigger(BodyStore.getData().notes);
    },

    onSave: function(value) {
        server.call({
            module: 'body',
            method: 'set_colony_notes',
            trigger: false,
            params: [
                BodyStore.getData().id,
                {
                    notes: value
                }
            ],
            scope: this
        });
    }
});

module.exports = NotesDataStore;
