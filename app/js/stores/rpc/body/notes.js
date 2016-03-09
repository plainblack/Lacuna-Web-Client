'use strict';

// TODO Should we be using 'storable'?

var Reflux              = require('reflux');

var NotesWindowActions  = require('js/actions/windows/notes');
var MapMenuActions      = require('js/actions/menu/map');

var BodyRPCStore        = require('js/stores/rpc/body');
var NotesWindowStore    = require('js/stores/windows/notes');

var NotesBodyRPCStore = Reflux.createStore({
    listenables : [
        NotesWindowActions,
        MapMenuActions
    ],

    init : function() {
        // Use this to store the notes before they get saved.
        this.data = '';

        // Is there a way to do this without tracking the planet ID?
        this.planetId = undefined;
        BodyRPCStore.listen(function(body) {
            if (body.id !== this.planetId) {
                // We changed planet. The save automagically happened below.
                // We just need to bring the new data in.
                this.planetId = body.id;
                this.onNotesSet(body.notes);
            }
        }, this);
    },

    getInitialState : function() {
        this.data = 'Write some notes here.';
        return this.data;
    },

    onNotesShow : function() {
        this.onNotesLoad();
    },

    onNotesHide : function() {
        this.onNotesClear();
    },

    onNotesLoad : function() {
        var data = BodyRPCStore.getData();
        this.planetId = data.id;
        this.trigger(data.notes);
    },

    onNotesClear : function() {
        this.trigger(this.getInitialState());
    },

    onNotesSet : function(value) {
        this.data = value;
        this.trigger(this.data);
    },

    onMapChangePlanet : function() {
        // Only do this while the window is open.
        if (NotesWindowStore.getData()) {
            this.onNotesClear();
        }
    }
});

module.exports = NotesBodyRPCStore;
