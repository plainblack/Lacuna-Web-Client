'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var BuildingWindowActions   = require('js/actions/windows/building');

var GenericBuildingStore        = require('js/stores/genericBuilding');
var BodyRPCStore            = require('js/stores/rpc/body');

var ResourceCost            = require('js/components/windows/building/resourceCost');

var RepairTab = React.createClass({

    mixins : [
        Reflux.connect(GenericBuildingStore, 'genericBuildingStore'),
        Reflux.connect(BodyRPCStore, 'body')
    ],

    handleClick : function() {
        BuildingWindowActions.buildingWindowRepair(this.state.genericBuildingStore.url, this.state.genericBuildingStore.id);
    },

    render : function() {
        var building    = this.state.genericBuildingStore;
        var body        = this.state.body;

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
                            number={building.repair_costs.food}
                            stored={body.food_stored}
                        />

                        <ResourceCost
                            icon="diamond"
                            number={building.repair_costs.ore}
                            stored={body.ore_stored}
                        />

                        <ResourceCost
                            icon="theme"
                            number={building.repair_costs.water}
                            stored={body.water_stored}
                        />

                        <ResourceCost
                            icon="lightning"
                            number={building.repair_costs.energy}
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
