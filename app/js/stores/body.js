'use strict';

var Reflux = require('reflux');
var _ = require('lodash');

var StatusActions = require('js/actions/status');

var TickerActions = require('js/actions/ticker');

var util = require('js/util');

function int(number) {
    return parseInt(number, 10);
}

var BodyStore = Reflux.createStore({
    listenables: [
        StatusActions,
        TickerActions
    ],

    getInitialState: function() {
        this.body = {
            "id" : '',
            "x" : 0,
            "y" : 0,
            "star_id" : '',
            "star_name" : '',
            "orbit" : 0,
            "type" : '',
            "name" : '',
            "image" : '',
            "size" : 0,
            "water" : 0,
            "ore" : {
                "gold" : 3399,
                "bauxite" : 4000,
            },
            "empire" : {
                "id" : '',
                "name" : '',
                "alignment" : '',
                "is_isolationist" : 0
            },
            "station" : {
                "id" : 0,
                "x" : 0,
                "y" : 0,
                "name" : ''
            },

            "needs_surface_refresh" : 0,
            "building_count" : 0,
            "build_queue_size" : 0,
            "build_queue_len" : 0,
            "plots_available" : 0,
            "happiness" : 0,
            "happiness_hour" : 0,
            "unhappy_date" : "01 13 2014 16:11:21 +0600",
            "neutral_entry" : "01 13 2014 16:11:21 +0600",
            "propaganda_boost" : 0,
            "food_stored" : 0,
            "food_capacity" : 0,
            "food_hour" : 0,
            "energy_stored" : 0,
            "energy_capacity" : 0,
            "energy_hour" : 0,
            "ore_hour" : 0,
            "ore_capacity" : 0,
            "ore_stored" : 0,
            "waste_hour" : 0,
            "waste_stored" : 0,
            "waste_capacity" : 0,
            "water_stored" : 0,
            "water_hour" : 0,
            "water_capacity" : 0,
            "skip_incoming_ships" : 0,
            "num_incoming_enemy" : 0,
            "num_incoming_ally" : 0,
            "num_incoming_own" : 0,
            "incoming_enemy_ships" : [],
            "incoming_ally_ships" : [],
            "incoming_own_ships" : [],

            "alliance" : {
                "id" : '',
                "name" : ''
            },
            "influence" : {
                "total" : 0,
                "spent" : 0
            }
        };

        return this.body;
    },

    onUpdate: function(status) {
        if (!status.body) {
            return;
        }

        this.body = status.body;

        // Clean up numbers for the sake of simplicity.
        this.body.x = int(this.body.x);
        this.body.y = int(this.body.y);

        this.body.num_incoming_own = int(this.body.num_incoming_own);
        this.body.num_incoming_ally = int(this.body.num_incoming_ally);
        this.body.num_incoming_enemy = int(this.body.num_incoming_enemy);

        var updateShip = function(ship) {
            ship.arrival_ms =
                util.serverDateToMs(status.server.time) - util.serverDateToMs(ship.date_arrives);
        };
        _.map(this.body.incoming_own_ships, updateShip);
        _.map(this.body.incoming_ally_ships, updateShip);
        _.map(this.body.incoming_enemy_ships, updateShip);

        this.body.size = int(this.body.size);

        this.trigger(this.body);
    },

    onClear: function() {
        this.trigger(this.getInitialState());
    },

    onTick: function() {

        var tickIncoming = function(ship) {
            // This is the *remaining* time to arrival so we need to add.
            ship.arrival_ms += 1000;
        };

        _.map(this.body.incoming_own_ships, tickIncoming);
        _.map(this.body.incoming_ally_ships, tickIncoming);
        _.map(this.body.incoming_enemy_ships, tickIncoming);

        this.trigger(this.body);
    }
});

module.exports = BodyStore;
