'use strict';

// TODO Should we be using 'storable'?

var Reflux              = require('reflux');

var NotesActions        = require('js/actions/windows/notes');
var MapActions          = require('js/actions/menu/map');

var BodyRPCStore        = require('js/stores/rpc/body');
var NotesWindowStore    = require('js/stores/windows/notes');

var NotesDataStore = Reflux.createStore({
    listenables : [
        NotesActions,
        MapActions
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
                NotesActions.notesSet(body.notes);
            }
        }, this);
    },

    getInitialState : function() {
        this.data = 'Write some notes here.';
        return this.data;
    },

    onNotesPanelShow : function() {
        NotesActions.notesLoad();
    },

    onNotesPanelHide : function() {
        NotesActions.notesClear();
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
            // TODO It is debatable whether we should just clear the notes,
            // or create an action
            // On the one hand we should not be causing actions from within a store.
            // On the other hand another task may want to attach to the notesClear action
            // but if that is the case, they can attach to the mapChangePlanet event!
            this.onNotesClear();
        }
    }
});

module.exports = NotesDataStore;
