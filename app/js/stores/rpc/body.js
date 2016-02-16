'use strict';

var Reflux             = require('reflux');
var StatefulStore      = require('js/stores/mixins/stateful');
var _                  = require('lodash');

var BodyStatusActions  = require('js/actions/bodyStatus');
var TickerActions      = require('js/actions/ticker');
var UserActions        = require('js/actions/user');

var ServerRPCStore     = require('js/stores/rpc/server');

var util               = require('js/util');
var int                = util.int;
var clone              = util.clone;

var BodyRPCStore = Reflux.createStore({
    listenables : [
        BodyStatusActions,
        TickerActions,
        UserActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return {
            id        : '',
            x         : 0,
            y         : 0,
            star_id   : '',
            star_name : '',
            orbit     : 0,
            type      : '',
            name      : '',
            image     : '',
            size      : 0,
            water     : 0,
            ore       : {
                anthracite   : 0,
                bauxite      : 0,
                beryl        : 0,
                chromite     : 0,
                chalcopyrite : 0,
                fluorite     : 0,
                galena       : 0,
                goethite     : 0,
                gold         : 0,
                gypsum       : 0,
                halite       : 0,
                kerogen      : 0,
                magnetite    : 0,
                methane      : 0,
                monazite     : 0,
                rutile       : 0,
                sulfur       : 0,
                trona        : 0,
                uraninite    : 0,
                zircon       : 0
            },
            empire : {
                id              : '',
                name            : '',
                alignment       : '',
                is_isolationist : 0
            },
            station : {
                id   : 0,
                x    : 0,
                y    : 0,
                name : ''
            },
            needs_surface_refresh : 0,
            building_count        : 0,
            build_queue_size      : 0,
            build_queue_len       : 0,
            plots_available       : 0,
            happiness             : 0,
            happiness_hour        : 0,
            unhappy_date          : '01 13 2014 16:11:21 +0600',
            neutral_entry         : '01 13 2014 16:11:21 +0600',
            propaganda_boost      : 0,
            food_stored           : 0,
            food_capacity         : 0,
            food_hour             : 0,
            energy_stored         : 0,
            energy_capacity       : 0,
            energy_hour           : 0,
            ore_hour              : 0,
            ore_capacity          : 0,
            ore_stored            : 0,
            waste_hour            : 0,
            waste_stored          : 0,
            waste_capacity        : 0,
            water_stored          : 0,
            water_hour            : 0,
            water_capacity        : 0,
            skip_incoming_ships   : 0,
            num_incoming_enemy    : 0,
            num_incoming_ally     : 0,
            num_incoming_own      : 0,
            incoming_enemy_ships  : [],
            incoming_ally_ships   : [],
            incoming_own_ships    : [],
            food_percent_full     : 0,
            ore_percent_full      : 0,
            water_percent_full    : 0,
            energy_percent_full   : 0,
            waste_percent_full    : 0,
            alliance              : {
                id   : '',
                name : ''
            },
            influence : {
                total : 0,
                spent : 0
            }
        };
    },

    onUserSignOut : function() {
        this.emit(this.getDefaultData());
    },

    onBodyStatusUpdate : function(body) {

        // ////////////
        // CLEAN UP //
        // ////////////

        body.x = int(body.x);
        body.y = int(body.y);

        body.num_incoming_own = int(body.num_incoming_own);
        body.num_incoming_ally = int(body.num_incoming_ally);
        body.num_incoming_enemy = int(body.num_incoming_enemy);

        body.plots_available = int(body.plots_available);
        body.building_count = int(body.building_count);

        // no point recalcing for each ship.
        var serverTimeMs = ServerRPCStore.getData().serverMoment.valueOf();

        var updateShip = function(ship) {
            ship.arrival_ms = util.serverDateToMs(ship.date_arrives) - serverTimeMs;
        };

        _.map(body.incoming_own_ships, updateShip);
        _.map(body.incoming_ally_ships, updateShip);
        _.map(body.incoming_enemy_ships, updateShip);

        body.size = int(body.size);
        body.orbit = int(body.orbit);

        body.food_hour = int(body.food_hour);
        body.food_stored = int(body.food_stored);
        body.food_capacity = int(body.food_capacity);

        body.ore_hour = int(body.ore_hour);
        body.ore_stored = int(body.ore_stored);
        body.ore_capacity = int(body.ore_capacity);

        body.water_hour = int(body.water_hour);
        body.water_stored = int(body.water_stored);
        body.water_capacity = int(body.water_capacity);

        body.energy_hour = int(body.energy_hour);
        body.energy_stored = int(body.energy_stored);
        body.energy_capacity = int(body.energy_capacity);

        body.waste_hour = int(body.waste_hour);
        body.waste_stored = int(body.waste_stored);
        body.waste_capacity = int(body.waste_capacity);

        body.happiness_hour = int(body.happiness_hour);
        body.happiness = int(body.happiness);

        body = this.handleResourcesPercentages(body);

        this.emit(body);
    },

    onBodyStatusClear : function() {
        this.emit(this.getDefaultData());
    },

    onTickerTick : function() {

        var body = clone(this.state);

        var tickIncoming = function(ship) {
            ship.arrival_ms -= 1000;
        };

        _.map(body.incoming_own_ships, tickIncoming);
        _.map(body.incoming_ally_ships, tickIncoming);
        _.map(body.incoming_enemy_ships, tickIncoming);

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

        body.food_stored = tickResource(
            body.food_hour, body.food_capacity, body.food_stored, 1);
        body.ore_stored = tickResource(
            body.ore_hour, body.ore_capacity, body.ore_stored, 1);
        body.water_stored = tickResource(
            body.water_hour, body.water_capacity, body.water_stored, 1);
        body.energy_stored = tickResource(
            body.energy_hour, body.energy_capacity, body.energy_stored, 1);
        body.waste_stored = tickResource(
            body.waste_hour, body.waste_capacity, body.waste_stored, 1);
        body.happiness = tickResource(
            body.happiness_hour, undefined, body.happiness, undefined);

        body = this.handleResourcesPercentages(body);

        this.emit(body);
    },

    handleResourcesPercentages : function(body) {
        body.food_percent_full = (body.food_stored / body.food_capacity) * 100;
        body.ore_percent_full = (body.ore_stored / body.ore_capacity) * 100;
        body.water_percent_full = (body.water_stored / body.water_capacity) * 100;
        body.energy_percent_full = (body.energy_stored / body.energy_capacity) * 100;
        body.waste_percent_full = (body.waste_stored / body.waste_capacity) * 100;

        // Do this to reduce updating of the progress bars.
        body.food_percent_full = int(body.food_percent_full);
        body.ore_percent_full = int(body.ore_percent_full);
        body.water_percent_full = int(body.water_percent_full);
        body.energy_percent_full = int(body.energy_percent_full);
        body.waste_percent_full = int(body.waste_percent_full);

        return body;
    }
});

module.exports = BodyRPCStore;
