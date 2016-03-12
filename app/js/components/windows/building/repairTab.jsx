'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var BuildingWindowActions   = require('js/actions/windows/building');

var BuildingRPCStore        = require('js/stores/rpc/building');
var BodyRPCStore            = require('js/stores/rpc/body');

var ResourceCost            = require('js/components/windows/building/resourceCost');

var RepairTab = React.createClass({

    mixins : [
        Reflux.connect(BuildingRPCStore, 'building'),
        Reflux.connect(BodyRPCStore, 'body')
    ],

    handleClick : function() {
        BuildingWindowActions.buildingWindowRepair(this.state.building.url, this.state.building.id);
    },

    render : function() {
        var b    = this.state.building;
        var body = this.state.body;

        return (
            <div className="ui grid">
                <div className="ui row">
                    <div className="five wide column">
                        <div style={{
                            textAlign  : 'center',
                            fontWeight : 'bold'
                        }}>
                            Repair costs
                        </div>
                    </div>
                </div>

                <div className="ui row">
                    <div className="five wide column">
                        <ResourceCost
                            icon="food"
                            number={b.repair_costs.food}
                            stored={body.food_stored}
                        />

                        <ResourceCost
                            icon="diamond"
                            number={b.repair_costs.ore}
                            stored={body.ore_stored}
                        />

                        <ResourceCost
                            icon="theme"
                            number={b.repair_costs.water}
                            stored={body.water_stored}
                        />

                        <ResourceCost
                            icon="lightning"
                            number={b.repair_costs.energy}
                            stored={body.energy_stored}
                        />
                    </div>
                </div>

                <div className="ui row">
                    <div className="five wide column">
                        <div className="ui medium fluid green button" onClick={this.handleClick}>
                            Repair
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = RepairTab;
