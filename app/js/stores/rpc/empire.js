'use strict';

var Reflux              = require('reflux');
var _                   = require('lodash');
var StatefulStore       = require('js/stores/mixins/stateful');

var EmpireStatusActions = require('js/actions/empireStatus');
var TickerActions       = require('js/actions/ticker');

var ServerRPCStore  = require('js/stores/rpc/server');

var util                = require('js/util');
var int                 = util.int;
var clone               = util.clone;

function bodyObjectToArray(bodyObj) {
    var arr = [];
    _.each(bodyObj, function(value, key) {
        arr.push({
            id   : key,
            name : value
        });
    });

    // Sort by name.
    return _.sortBy(arr, 'name');
}

var EmpireRPCStore = Reflux.createStore({
    listenables : [
        EmpireStatusActions,
        TickerActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return {
            bodies : {
                colonies    : [],
                mystations  : [],
                ourstations : [],
                babies      : []
            },
            colonies             : [],
            essentia             : 0,
            exactEssentia        : 0,
            has_new_messages     : 0,
            home_planet_id       : '',
            id                   : '',
            insurrect_value      : 0,
            is_isolationist      : 0,
            latest_message_id    : 0,
            name                 : '',
            next_colony_cost     : 0,
            next_colony_srcs     : 0,
            next_station_cost    : 0,
            planets              : [],
            primary_embassy_id   : 0,
            rpc_count            : 0,
            self_destruct_active : 0,
            self_destruct_date   : '',
            stations             : [],
            status_message       : '',
            tech_level           : 0
        };
    },

    onTickerTick : function() {
        if (!this.state) {
            return;
        }

        var empire = clone(this.state);

        if (empire.self_destruct_active) {
            empire.self_destruct_ms -= 1000;
        }

        this.emit(empire);
    },

    onEmpireStatusUpdate : function(empire) {

        // Possible things to do here:
        //  ~ Turn self_destruct_date into a Date object.
        //  ~ See also: Game.ProcessStatus.

        empire.self_destruct_active = int(empire.self_destruct_active);
        empire.exactEssentia = parseFloat(empire.essentia, 10);
        empire.essentia = int(empire.essentia);

        if (empire.self_destruct_active) {
            empire.self_destruct_ms =
                util.serverDateToMs(empire.self_destruct_date) -
                ServerRPCStore.getData().serverMoment.valueOf();
        }

        // Fix up all the planet lists.
        empire.colonies = bodyObjectToArray(empire.colonies);
        empire.planets = bodyObjectToArray(empire.planets);
        empire.stations = bodyObjectToArray(empire.stations);

        this.emit(empire);
    },

    onEmpireStatusClear : function() {
        this.emit(this.getDefaultData());
    }
});

module.exports = EmpireRPCStore;
