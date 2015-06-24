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

        //                          .i;;;;i.
        //                        iYcviii;vXY:
        //                      .YXi       .i1c.
        //                     .YC.     .    in7.
        //                    .vc.   ......   ;1c.
        //                    i7,   ..        .;1;
        //                   i7,   .. ...      .Y1i
        //                  ,7v     .6MMM@;     .YX,
        //                 .7;.   ..IMMMMMM1     :t7.
        //                .;Y.     ;$MMMMMM9.     :tc.
        //                vY.   .. .nMMM@MMU.      ;1v.
        //               i7i   ...  .#MM@M@C. .....:71i
        //              it:   ....   $MMM@9;.,i;;;i,;tti
        //             :t7.  .....   0MMMWv.,iii:::,,;St.
        //            .nC.   .....   IMMMQ..,::::::,.,czX.
        //           .ct:   ....... .ZMMMI..,:::::::,,:76Y.
        //           c2:   ......,i..Y$M@t..:::::::,,..inZY
        //          vov   ......:ii..c$MBc..,,,,,,,,,,..iI9i
        //         i9Y   ......iii:..7@MA,..,,,,,,,,,....;AA:
        //        iIS.  ......:ii::..;@MI....,............;Ez.
        //       .I9.  ......:i::::...8M1..................C0z.
        //      .z9;  ......:i::::,.. .i:...................zWX.
        //      vbv  ......,i::::,,.      ................. :AQY
        //     c6Y.  .,...,::::,,..:t0@@QY. ................ :8bi
        //    :6S. ..,,...,:::,,,..EMMMMMMI. ............... .;bZ,
        //   :6o,  .,,,,..:::,,,..i#MMMMMM#v.................  YW2.
        //  .n8i ..,,,,,,,::,,,,.. tMMMMM@C:.................. .1Wn
        //  7Uc. .:::,,,,,::,,,,..   i1t;,..................... .UEi
        //  7C...::::::::::::,,,,..        ....................  vSi.
        //  ;1;...,,::::::,.........       ..................    Yz:
        //   v97,.........                                     .voC.
        //    izAotX7777777777777777777777777777777777777777Y7n92:
        //      .;CoIIIIIUAA666666699999ZZZZZZZZZZZZZZZZZZZZ6ov.

        // THIS CODE IS TERRIBLE. IT IS NOT GOOD REACT CODE. DO NOT COPY IT.
        this.planetId = undefined;
        BodyRPCStore.listen(function(body) {
            if (body.id !== this.planetId) {
                // We changed planet. The save automagically happend below. We just need to
                // bring the new data in.
                this.planetId = body.id;
                NotesActions.set(body.notes);
            }
        }, this);
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
        var data = BodyRPCStore.getData();
        this.planetId = data.id;
        this.trigger(data.notes);
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
                this.planetId,
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
