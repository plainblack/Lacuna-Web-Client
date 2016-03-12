'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var Tabber                  = require('js/components/tabber');
var Tabs                    = Tabber.Tabs;
var Tab                     = Tabber.Tab;

var BuildingWindowActions   = require('js/actions/windows/building');

var BuildingRPCStore        = require('js/stores/rpc/building');

var ProductionTab           = require('js/components/windows/building/productionTab');
var RepairTab               = require('js/components/windows/building/repairTab');

var BUILDINGS = {
    '/essentiavein'     : require('js/components/buildings/essentiaVein'),
    '/inteltraining'    : require('js/components/buildings/intelTraining'),
    '/mayhemtraining'   : require('js/components/buildings/mayhemTraining'),
    '/politicstraining' : require('js/components/buildings/politicsTraining'),
    '/thefttraining'    : require('js/components/buildings/theftTraining')
};

var BuildingTabs = React.createClass({

    propTypes : {
        id         : React.PropTypes.string.isRequired,
        url        : React.PropTypes.string.isRequired,
        efficiency : React.PropTypes.number.isRequired
    },

    mixins : [
        Reflux.connect(BuildingRPCStore, 'building')
    ],

    loadProduction : function() {
        BuildingWindowActions.buildingWindowLoad(this.props.url, this.props.id);
    },

    render : function() {
        var tabs = [];

        if (this.props.efficiency !== 100) {
            tabs.push(
                <Tab title="Repair" key="Repair" onSelect={this.loadProduction}>
                    <RepairTab />
                </Tab>
            );
        }

        tabs.push(
            <Tab title="Production" key="Production" onSelect={this.loadProduction}>
                <ProductionTab />
            </Tab>
        );

        var getTabs = BUILDINGS[this.props.url];

        if (typeof getTabs === 'function') {
            var buildingSpecificTabs = getTabs(this.state.building);

            if (buildingSpecificTabs) {
                tabs = tabs.concat(buildingSpecificTabs);
            }
        }

        return (
            <div>
                <Tabs>
                    {tabs}
                </Tabs>
            </div>
        );
    }
});

module.exports = BuildingTabs;
