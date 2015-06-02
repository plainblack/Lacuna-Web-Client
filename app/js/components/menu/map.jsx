'use strict';

var React = require('react');
var Reflux = require('reflux');

var BodyStore = require('js/stores/body');
var MapModeStore = require('js/stores/menu/mapMode');

var Map = React.createClass({
    mixins: [
        Reflux.connect(MapModeStore, 'mapMode'),
        Reflux.connect(BodyStore, 'body')
    ],
    getInitialState: function() {
        return {
            mapMode: MapModeStore.PLANET_MAP_MODE
        };
    },
    previousMapMode: '',
    render: function() {


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
        // TODO: factor out all this crappy glue code!

        // console.log('Rendering map - mapMode = ' + this.state.mapMode);

        var Lacuna = YAHOO.lacuna;
        var Game = Lacuna.Game;

        if (this.previousMapMode !== this.state.mapMode) {
            if (this.state.mapMode === MapModeStore.PLANET_MAP_MODE) {
                // Render planet map view.
                Game.PlanetJump(Game.GetCurrentPlanet());
            } else {
                // Render star map view.
                Lacuna.MapPlanet.MapVisible(false);
                Lacuna.MapStar.MapVisible(true);
                Lacuna.MapStar.Load();
                Lacuna.MapStar.Jump(this.state.body.x, this.state.body.y);
            }
        }

        // Great balls of fire! What is this madness?!?!
        // Basically, Game.PlanetJump updates this.state.body, which causes a re-render then
        // Game.PlanetJump gets called again and the whole thing goes forever.
        // Solution: keep track of the previous mapMode and don't do anything if it's the same.
        // TODO: fix this when possible!!!!
        this.previousMapMode = this.state.mapMode;

        return <div></div>;
    }
});

module.exports = Map;
