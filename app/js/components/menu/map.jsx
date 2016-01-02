'use strict';

var React = require('react');
var Reflux = require('reflux');

var MapActions = require('js/actions/menu/map');

var PlanetMap = require('js/components/menu/planetMap');

var BodyRPCStore = require('js/stores/rpc/body');
var MapModeStore = require('js/stores/menu/mapMode');
var PlanetStore = require('js/stores/menu/planet');
var MenuStore = require('js/stores/menu');

var Lacuna = YAHOO.lacuna;

// TODO: factor out all this glue code

var Map = React.createClass({

    mixins: [
        Reflux.connect(MapModeStore, 'mapMode'),
        Reflux.connect(BodyRPCStore, 'body'),
        Reflux.connect(PlanetStore, 'planet'),
        Reflux.connect(MenuStore, 'menuVisible')
    ],

    previousMapMode: '',

    componentDidUpdate: function() {
        if (
            this.state.body.incoming_ally_ships.length > 0 ||
            this.state.body.incoming_enemy_ships.length > 0 ||
            this.state.body.incoming_own_ships.length > 0
        ) {
            Lacuna.Notify.Show(this.state.planet);
        } else {
            Lacuna.Notify.Hide();
        }
    },

    render: function() {

        // console.log(this.state);

        // Do nothing if the menu isn't shown.
        if (!this.state.menuVisible) {

            // Reset these values because we're *probably* logged out.
            this.previousMapMode = MapModeStore.PLANET_MAP_MODE;
            this.state.planet = '';

            return <div></div>;
        }

        if (!this.state.planet) {
            return <div></div>;
        }

        // console.log('Rendering map');
        // console.log('mapMode = ' + this.state.mapMode + '(' + this.previousMapMode + ')');

        var Lacuna = YAHOO.lacuna;
        var Game = Lacuna.Game;

        if (
            this.state.mapMode !== this.previousMapMode &&
            this.state.mapMode === MapModeStore.STAR_MAP_MODE
        ) {
            // Hide map planet windows
            if (Lacuna.MapPlanet.buildingDetails) {
                Lacuna.MapPlanet.buildingDetails.hide();
            }
            if (Lacuna.MapPlanet.buildingBuilder) {
                Lacuna.MapPlanet.buildingBuilder.hide();
            }

            // Render star map view.
            Lacuna.MapStar.MapVisible(true);
            Lacuna.MapStar.Load();
            Lacuna.MapStar.Jump(this.state.body.x, this.state.body.y);

            // Sadly, we have to pull hacky tricks like this to avoid infinite loops.
            this.previousMapMode = this.state.mapMode;

            // Return nothing because we're using the old (non-React) mapping system.
            return <div></div>;
        } else if (
            this.state.mapMode !== this.previousMapMode &&
            this.state.mapMode === MapModeStore.PLANET_MAP_MODE
        ) {
            Lacuna.MapStar.MapVisible(false);
            MapActions.refresh();
            this.previousMapMode = this.state.mapMode;
        }

        return (
            <PlanetMap />
        );
    }
});

module.exports = Map;
