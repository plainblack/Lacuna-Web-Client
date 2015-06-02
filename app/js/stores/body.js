'use strict';

var Reflux = require('reflux');

var StatusActions = require('js/actions/status');

var BodyStore = Reflux.createStore({
    listenables: StatusActions,

    data: undefined,

    getInitialState: function() {
        if (this.data) {
            return this.data;
        } else {
            return {
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
        }
    },

    onUpdate: function(status) {
        if (!status.body) {
            return;
        } else {
            this.data = status.body;

            // Simplify data.
            this.data.x = parseInt(this.data.x, 10);
            this.data.y = parseInt(this.data.y, 10);

            this.trigger(this.data);
        }
    },

    onClear: function() {
        this.data = undefined;
        this.trigger(this.getInitialState());
    }
});

module.exports = BodyStore;
