'use strict';

var Reflux          = require('reflux');
var StatefulStore   = require('js/stores/mixins/stateful');

var BuildingActions = require('js/actions/building');

var server = require('js/server');

var BuildingRPCStore = Reflux.createStore({

    listenables : [
        BuildingActions
    ],

    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return {
            id              : '',
            name            : '',
            image           : '',
            level           : 0,
            x               : 0,
            y               : 0,
            food_hour       : 0,
            food_capacity   : 0,
            energy_hour     : 0,
            energy_capacity : 0,
            ore_hour        : 0,
            ore_capacity    : 0,
            water_hour      : 0,
            water_capacity  : 0,
            waste_hour      : 0,
            waste_capacity  : 0,
            happiness_hour  : 0,
            efficiency      : 0,

            repair_costs : {
                food   : 0,
                water  : 0,
                energy : 0,
                ore    : 0
            },
            downgrade : {
                can    : 1,
                reason : '',
                image  : ''
            },
            upgrade : {
                can    : 1,
                reason : '',

                cost : {
                    food   : 0,
                    water  : 0,
                    energy : 0,
                    waste  : 0,
                    ore    : 0,
                    time   : 0
                },
                production : {
                    food_hour       : 0,
                    food_capacity   : 0,
                    energy_hour     : 0,
                    energy_capacity : 0,
                    ore_hour        : 0,
                    ore_capacity    : 0,
                    water_hour      : 0,
                    water_capacity  : 0,
                    waste_hour      : 0,
                    waste_capacity  : 0,
                    happiness_hour  : 0
                },
                image : ''
            }
        };
    },

    handleNewData : function(result) {
        var building = result.building;

        // Glyph buildings will return a halls cost in the upgrade cost but normal buildings will
        // will only return the standard resources. Make sure they all exist so as to prevent
        // errors on the component level.
        building.upgrade.cost.food   = building.upgrade.cost.food || 0;
        building.upgrade.cost.ore    = building.upgrade.cost.ore || 0;
        building.upgrade.cost.water  = building.upgrade.cost.water || 0;
        building.upgrade.cost.energy = building.upgrade.cost.energy || 0;
        building.upgrade.cost.time   = building.upgrade.cost.time || 0;
        building.upgrade.cost.halls  = building.upgrade.cost.halls || 0;

        console.log(building);

        this.emit(building);
    },

    onClear : function() {
        this.emit(this.getDefaultData());
    },

    onLoadBuildingProduction : function(url, id) {
        server.call({
            module  : url.replace(/^\//, ''), // Cull leading '/' from url
            method  : 'view',
            params  : [id],
            scope   : this,
            success : this.handleNewData
        });
    }
});

module.exports = BuildingRPCStore;
