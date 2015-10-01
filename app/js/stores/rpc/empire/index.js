'use strict';

var Reflux = require('reflux');
var _ = require('lodash');

var StatusActions = require('js/actions/status');
var TickerActions = require('js/actions/ticker');
var UserActions   = require('js/actions/user');

var util = require('js/util');
var int = util.int;

function bodyObjectToArray(bodyObj) {
    var arr = [];
    _.each(bodyObj, function(value, key) {
        arr.push({
            id: key,
            name: value
        });
    });

    // Sort by name.
    return _.sortBy(arr, 'name');
}

var EmpireRPCStore = Reflux.createStore({
    listenables: [
        StatusActions,
        TickerActions,
        UserActions
    ],

    data: {},

    getInitialState: function() {
        this.data = {
            colonies : [],
            essentia: 0,
            has_new_messages: 0,
            home_planet_id: '',
            id : '',
            insurrect_value: 0,
            is_isolationist: 0,
            latest_message_id: 0,
            name: '',
            next_colony_cost: 0,
            next_colony_srcs: 0,
            next_station_cost: 0,
            planets: [],
            primary_embassy_id: 0,
            rpc_count: 0,
            self_destruct_active: 0,
            self_destruct_date: '',
            stations: [],
            status_message: '',
            tech_level: 0
        };

        return this.data;
    },

    getData: function() {
        return this.data;
    },

    onSignOut : function() {
        this.getInitialState();
    },

    onTick: function() {
        if (!this.data) {
            return;
        }

        var updated = 0;
        if (this.data.self_destruct_active) {
            this.data.self_destruct_ms -= 1000;
            updated = 1;
        }

        if (updated) {
            this.trigger(this.data);
        }
    },

    onUpdate: function(status) {
        if (!status.empire) {
            return;
        } else {
            this.data = status.empire;

            // Possible things to do here:
            //  ~ Turn self_destruct_date into a Date object.
            //  ~ See also: Game.ProcessStatus.
            this.data.self_destruct_active = int(this.data.self_destruct_active);

            if (this.data.self_destruct_active)
            {
                this.data.self_destruct_ms =
                    util.serverDateToMs(this.data.self_destruct_date) -
                    util.serverDateToMs(status.server.time);
            }

            // Fix up all the planet lists.
            this.data.colonies = bodyObjectToArray(this.data.colonies);
            this.data.planets = bodyObjectToArray(this.data.planets);
            this.data.stations = bodyObjectToArray(this.data.stations);

            this.trigger(this.data);
        }
    },

    onClear: function() {
        this.data = this.getInitialState();
        this.trigger(this.data);
    }
});

module.exports = EmpireRPCStore;
