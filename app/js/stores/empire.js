'use strict';

var Reflux = require('reflux');

var StatusActions = require('js/actions/status');

var EmpireStore = Reflux.createStore({
    listenables: StatusActions,

    data: undefined,

    getInitialState: function() {
        if (this.data) {
            return this.data;
        } else {
            return {
                colonies : {},
                essentia: 0,
                has_new_messages: 0,
                home_planet_id: '',
                id : '',
                insurrect_value: 0,
                is_isolationist: 0,
                latest_message_id: 0,
                name: '',
                next_colony_cost: 0,
                next_station_cost: 0,
                planets: {},
                primary_embassy_id: 0,
                rpc_count: 0,
                self_destruct_active: 0,
                self_destruct_date: '',
                stations: {},
                status_message: '',
                tech_level: 0
            };
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

            this.trigger(this.data);
        }
    },

    onClear: function() {
        this.data = undefined;
        this.trigger(this.getInitialState());
    }
});

module.exports = EmpireStore;
