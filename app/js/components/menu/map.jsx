'use strict';

var React = require('react');
var Reflux = require('reflux');

var BodyRPCStore = require('js/stores/rpc/body');
var MapModeStore = require('js/stores/menu/mapMode');
var PlanetStore = require('js/stores/menu/planet');
var MenuStore = require('js/stores/menu');

// TODO: factor out all this glue code

var Map = React.createClass({
    mixins: [
        Reflux.connect(MapModeStore, 'mapMode'),
        Reflux.connect(BodyRPCStore, 'body'),
        Reflux.connect(PlanetStore, 'planet'),
        Reflux.connect(MenuStore, 'menuVisible')
    ],
    getInitialState: function() {
        return {
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
            this.state.planet = '';

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

            // Sadly, we have to pull hacky tricks like this to avoid infinite loops.
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

            // Sadly, we have to pull hacky tricks like this to avoid infinite loops.
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
