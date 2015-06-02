'use strict';

var React = require('react');
var Reflux = require('reflux');

var BodyStore = require('js/stores/body');
var MapModeStore = require('js/stores/menu/mapMode');
var PlanetStore = require('js/stores/menu/planet');
var MenuStore = require('js/stores/window/menu');


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

var Map = React.createClass({
    mixins: [
        Reflux.connect(MapModeStore, 'mapMode'),
        Reflux.connect(BodyStore, 'body'),
        Reflux.connect(PlanetStore, 'planet'),
        Reflux.connect(MenuStore, 'menuVisible')
    ],
    getInitialState: function() {
        return {
            mapMode: MapModeStore.PLANET_MAP_MODE,
            planet: '',
            menuVisible: false
        };
    },
    previousMapMode: '',
    previousPlanetId: '',
    render: function() {

        // console.log(this.state);

        // Do nothing if the menu isn't shown.
        if (this.state.menuVisible === false) {

            // Reset these values because we're *probably* logged out.
            this.previousMapMode = MapModeStore.PLANET_MAP_MODE;
            this.previousPlanetId = '';

            return <div></div>;
        }

        if (!this.state.planet) {
            return <div></div>;
        }

        // console.log('Rendering map');
        // console.log('mapMode = ' + this.state.mapMode + '(' + this.previousMapMode + ')');
        // console.log('planet = ' + this.state.planet + '(' + this.previousPlanetId + ')');

        var Lacuna = YAHOO.lacuna;
        var Game = Lacuna.Game;


        if (
            // Render if the planet id has changed... OR...
            this.previousPlanetId !== this.state.planet ||
            (
                // Render if we've changed from the starMap to the planetMap
                this.previousMapMode !== this.state.mapMode &&
                this.state.mapMode === MapModeStore.PLANET_MAP_MODE
            )
        ) {
            // Now that we've made sure...
            // Render the planet view.
            Lacuna.MapStar.MapVisible(false);
            Lacuna.MapPlanet.MapVisible(true);
            Lacuna.MapPlanet.Load(this.state.planet, true);

            // Sadly, we have to pull hacky tricks like this to avoid infinate loops.
            this.previousPlanetId = this.state.planet;
            this.previousMapMode = this.state.mapMode;

            // Return nothing because we're using the old (non-React) mapping system.
            return <div></div>;
        }

        if (
            this.state.mapMode !== this.previousMapMode &&
            this.state.mapMode === MapModeStore.STAR_MAP_MODE
        ) {
            // Render star map view.
            Lacuna.MapPlanet.MapVisible(false);
            Lacuna.MapStar.MapVisible(true);
            Lacuna.MapStar.Load();
            Lacuna.MapStar.Jump(this.state.body.x, this.state.body.y);

            // Sadly, we have to pull hacky tricks like this to avoid infinate loops.
            this.previousPlanetId = this.state.planet;
            this.previousMapMode = this.state.mapMode;

            // Return nothing because we're using the old (non-React) mapping system.
            return <div></div>;
        }

        // We shouldn't end up here, but consiering how hacky all this is it *may* hapen. :(
        return <div></div>;
    }
});

module.exports = Map;

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
