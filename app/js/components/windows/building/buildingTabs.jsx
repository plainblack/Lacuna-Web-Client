'use strict';

var React           = require('react');

var Tabber          = require('js/components/tabber');
var Tabs            = Tabber.Tabs;
var Tab             = Tabber.Tab;

var BuildingActions = require('js/actions/windows/building');

var ProductionTab   = require('js/components/windows/building/productionTab');
var RepairTab       = require('js/components/windows/building/repairTab');

var BuildingTabs = React.createClass({

    propTypes : {
        id         : React.PropTypes.string.isRequired,
        url        : React.PropTypes.string.isRequired,
        efficiency : React.PropTypes.number.isRequired
    },

    loadProduction : function() {
        BuildingActions.clear();
        BuildingActions.loadBuildingProduction(this.props.url, this.props.id);
    },

    render : function() {
        return (
            <div>
                <Tabs>
                    {
                        this.props.efficiency !== 100
                        ? (
                            <Tab title="Repair" onSelect={this.loadProduction}>
                                <RepairTab />
                            </Tab>
                        )
                        : ''
                    }

                    <Tab title="Production" onSelect={this.loadProduction}>
                        <ProductionTab />
                    </Tab>
                </Tabs>
            </div>
        );
    }
});

module.exports = BuildingTabs;
