'use strict';

var React           = require('react');

var Tabber          = require('js/components/tabber');
var Tabs            = Tabber.Tabs;
var Tab             = Tabber.Tab;

var BuildingActions = require('js/actions/windows/building');

var ProductionTab   = require('js/components/windows/building/productionTab');

var BuildingTabs = React.createClass({

    propTypes : {
        id  : React.PropTypes.string.isRequired,
        url : React.PropTypes.string.isRequired
    },

    loadProductionTab : function() {
        BuildingActions.clear();
        BuildingActions.loadBuildingProduction(this.props.url, this.props.id);
    },

    render : function() {
        return (
            <div>
                <Tabs>
                    <Tab title="Production" onSelect={this.loadProductionTab}>
                        <ProductionTab />
                    </Tab>
                </Tabs>
            </div>
        );
    }
});

module.exports = BuildingTabs;
