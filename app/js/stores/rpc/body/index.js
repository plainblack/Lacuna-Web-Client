'use strict';

var Reflux = require('reflux');
var _ = require('lodash');

var StatusActions = require('js/actions/status');
var TickerActions = require('js/actions/ticker');
var UserActions   = require('js/actions/user');

var util = require('js/util');
var int = util.int;

var BodyRPCStore = Reflux.createStore({
    listenables: [
        StatusActions,
        TickerActions,
        UserActions
    ],

    data: {},

    getInitialState: function() {
        this.data = {
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

            "food_percent_full": 0,
            "ore_percent_full": 0,
            "water_percent_full": 0,
            "energy_percent_full": 0,
            "waste_percent_full": 0,

            "alliance" : {
                "id" : '',
                "name" : ''
            },
            "influence" : {
                "total" : 0,
                "spent" : 0
            }
        };

        return this.data;
    },

    getData: function() {
        return this.data;
    },

    onSignOut : function() {
        this.getInitialState();
    },

    onUpdate: function(status) {
        if (!status.body) {
            return;
        }

        this.data = status.body;

        //////////////
        // CLEAN UP //
        //////////////

        this.data.x = int(this.data.x);
        this.data.y = int(this.data.y);


        this.data.num_incoming_own = int(this.data.num_incoming_own);
        this.data.num_incoming_ally = int(this.data.num_incoming_ally);
        this.data.num_incoming_enemy = int(this.data.num_incoming_enemy);


        this.data.plots_available = int(this.data.plots_available);
        this.data.building_count = int(this.data.building_count);

        // no point recalcing for each ship.
        var server_time_ms = util.serverDateToMs(status.server.time);

        var updateShip = function(ship) {
            ship.arrival_ms =
            util.serverDateToMs(ship.date_arrives) - server_time_ms;
        };

        _.map(this.data.incoming_own_ships, updateShip);
        _.map(this.data.incoming_ally_ships, updateShip);
        _.map(this.data.incoming_enemy_ships, updateShip);


        this.data.size = int(this.data.size);
        this.data.orbit = int(this.data.orbit);

        this.data.food_hour = int(this.data.food_hour);
        this.data.food_stored = int(this.data.food_stored);
        this.data.food_capacity = int(this.data.food_capacity);

        this.data.ore_hour = int(this.data.ore_hour);
        this.data.ore_stored = int(this.data.ore_stored);
        this.data.ore_capacity = int(this.data.ore_capacity);

        this.data.water_hour = int(this.data.water_hour);
        this.data.water_stored = int(this.data.water_stored);
        this.data.water_capacity = int(this.data.water_capacity);

        this.data.energy_hour = int(this.data.energy_hour);
        this.data.energy_stored = int(this.data.energy_stored);
        this.data.energy_capacity = int(this.data.energy_capacity);

        this.data.waste_hour = int(this.data.waste_hour);
        this.data.waste_stored = int(this.data.waste_stored);
        this.data.waste_capacity = int(this.data.waste_capacity);

        this.data.happiness_hour = int(this.data.happiness_hour);
        this.data.happiness = int(this.data.happiness);

        this.trigger(this.data);
    },

    onClear: function() {
        this.data = this.getInitialState();
        this.trigger(this.data);
    },

    onTick: function() {

        var tickIncoming = function(ship) {
            ship.arrival_ms -= 1000;
        };

        _.map(this.data.incoming_own_ships, tickIncoming);
        _.map(this.data.incoming_ally_ships, tickIncoming);
        _.map(this.data.incoming_enemy_ships, tickIncoming);

        var tickResource = function(production, capacity, stored, stop_at_zero) {
            var amount = production / 60 / 60;
            var rv = stored + amount;

            if (typeof capacity !== 'undefined' && rv > capacity) {
                return int(capacity);
            } else if (rv < 0 && stop_at_zero) {
                return 0;
            } else {
                return int(rv);
            }
        };

        this.data.food_stored = tickResource(
            this.data.food_hour, this.data.food_capacity, this.data.food_stored, 1);
        this.data.ore_stored = tickResource(
            this.data.ore_hour, this.data.ore_capacity, this.data.ore_stored, 1);
        this.data.water_stored = tickResource(
            this.data.water_hour, this.data.water_capacity, this.data.water_stored, 1);
        this.data.energy_stored = tickResource(
            this.data.energy_hour, this.data.energy_capacity, this.data.energy_stored, 1);
        this.data.waste_stored = tickResource(
            this.data.waste_hour, this.data.waste_capacity, this.data.waste_stored, 1);
        this.data.happiness = tickResource(
            this.data.happiness_hour, undefined, this.data.happiness, undefined);

        this.data.food_percent_full = (this.data.food_stored / this.data.food_capacity) * 100;
        this.data.ore_percent_full = (this.data.ore_stored / this.data.ore_capacity) * 100;
        this.data.water_percent_full = (this.data.water_stored / this.data.water_capacity) * 100;
        this.data.energy_percent_full = (this.data.energy_stored / this.data.energy_capacity) * 100;
        this.data.waste_percent_full = (this.data.waste_stored / this.data.waste_capacity) * 100;

        // Do this to reduce updating of the progress bars.
        this.data.food_percent_full = int(this.data.food_percent_full);
        this.data.ore_percent_full = int(this.data.ore_percent_full);
        this.data.water_percent_full = int(this.data.water_percent_full);
        this.data.energy_percent_full = int(this.data.energy_percent_full);
        this.data.waste_percent_full = int(this.data.waste_percent_full);

        this.trigger(this.data);
    }
});

module.exports = BodyRPCStore;
