'use strict';

var React              = require('react');
var Reflux             = require('reflux');

var BuildingRPCStore   = require('js/stores/rpc/building');
var BodyRPCStore       = require('js/stores/rpc/body');

var ResourceProduction = require('js/components/windows/building/resourceProduction');
var ResourceCost       = require('js/components/windows/building/resourceCost');

var ProductionTab = React.createClass({

    mixins : [
        Reflux.connect(BuildingRPCStore, 'building'),
        Reflux.connect(BodyRPCStore, 'body')
    ],

    render : function() {
        var b    = this.state.building;
        var body = this.state.body;

        console.log(b);

        return (
            <div className="ui grid">
                <div className="four wide column">
                    <strong>Current production</strong>

                    <ResourceProduction icon="food" number={b.food_hour} />
                    <ResourceProduction icon="diamond" number={b.ore_hour} />
                    <ResourceProduction icon="theme" number={b.water_hour} />
                    <ResourceProduction icon="lightning" number={b.energy_hour} />
                    <ResourceProduction icon="trash" number={b.waste_hour} />
                    <ResourceProduction icon="smile" number={b.happiness_hour} />
                </div>

                <div className="four wide column">
                    <strong>Upgrade production</strong>

                    <ResourceProduction icon="food" number={b.upgrade.production.food_hour} />
                    <ResourceProduction icon="diamond" number={b.upgrade.production.ore_hour} />
                    <ResourceProduction icon="theme" number={b.upgrade.production.water_hour} />
                    <ResourceProduction icon="lightning" number={b.upgrade.production.energy_hour}/>
                    <ResourceProduction icon="trash" number={b.upgrade.production.waste_hour} />
                    <ResourceProduction icon="smile" number={b.upgrade.production.happiness_hour} />
                </div>

                <div className="four wide column">
                    <strong>Upgrade cost</strong>

                    <ResourceCost body={body} icon="food" number={b.upgrade.cost.food} />
                    <ResourceCost body={body} icon="diamond" number={b.upgrade.cost.ore} />
                    <ResourceCost body={body} icon="theme" number={b.upgrade.cost.water} />
                    <ResourceCost body={body} icon="lightning" number={b.upgrade.cost.energy}/>
                    <ResourceCost body={body} icon="trash" number={b.upgrade.cost.waste} />
                </div>
            </div>
        );
    }
});

module.exports = ProductionTab;
