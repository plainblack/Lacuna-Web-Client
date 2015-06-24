'use strict';

var Reflux = require('reflux');

var NotesActions = require('js/actions/window/notes');
var MapActions = require('js/actions/menu/map');

var BodyRPCStore = require('js/stores/rpc/body');
var NotesWindowStore = require('js/stores/window/notes');

var server = require('js/server');

var NotesDataStore = Reflux.createStore({
    listenables: [
        NotesActions,
        MapActions
    ],

    init: function() {
        // Use this to store the notes before they get saved.
        this.data = '';
    },

    getInitialState: function() {
        this.data = 'Write some notes here.';
        return this.data;
    },

    onShow: function() {
        NotesActions.load();
    },

    onHide: function() {
        NotesActions.clear();
    },

    onLoad: function() {
        this.trigger(BodyRPCStore.getData().notes);
    },

    onClear: function() {
        this.trigger(this.getInitialState());
    },

    onSet: function(value) {
        this.data = value;
        this.trigger(this.data);
    },

    onSave: function() {
        server.call({
            module: 'body',
            method: 'set_colony_notes',
            trigger: false,
            params: [
                BodyRPCStore.getData().id,
                {
                    notes: this.data
                }
            ],
            scope: this
        });
    },

    onChangePlanet: function() {
        // Only do this while the window is open.
        if (NotesWindowStore.getData()) {
            NotesActions.save();
            NotesActions.clear();
        }
    }
});

module.exports = NotesDataStore;
