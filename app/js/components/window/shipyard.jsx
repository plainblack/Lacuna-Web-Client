'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var GenericBuildingStore    = require('js/stores/genericBuilding.js');

var WindowActions           = require('js/actions/window');
var BuildingWindowActions   = require('js/actions/windows/building');
var ShipyardRPCActions      = require('js/actions/rpc/shipyard');

var StandardTabs            = require('js/components/window/building/standardTabs');
var BuildingInformation     = require('js/components/window/building/information');
var BuildFleet              = require('js/components/window/shipyard/buildFleet');

var Tabber                  = require('js/components/tabber');

var Tabs                    = Tabber.Tabs;
var Tab                     = Tabber.Tab;

var Shipyard = React.createClass({
    statics : {
        options : {
            title   : 'Shipyard',
            width   : 700,
            height  : 420
        }
    },
    mixins : [
        Reflux.connect(GenericBuildingStore, 'genericBuildingStore'),
    ],
    componentWillMount : function() {
        BuildingWindowActions.buildingWindowClear();
        ShipyardRPCActions.requestShipyardRPCView( this.props.options.id );
    },

    closeWindow : function() {
        WindowActions.windowCloseByType('building');
    },

    render : function() {
        var building = this.state.genericBuildingStore;
        var tabs = StandardTabs.tabs(this.props.options, building);
        tabs.push(
            <Tab title="Build Queue" key="Build Queue" onSelect={ _.partial(ShipyardRPCActions.requestShipyardRPCViewBuildQueue, building.id ) }>
                <p>Not Yet Implemented!</p>
            </Tab>
        );
        
        tabs.push(
            <Tab title="Build Fleet" key="Build Fleet" onSelect={ _.partial(ShipyardRPCActions.requestShipyardRPCGetBuildable, building.id ) } >
                <BuildFleet />
            </Tab>
        );

        tabs.push(
            <Tab title="Repair Ships" key="Repair Ships" onSelect={ _.partial(ShipyardRPCActions.requestShipyardRPCGetRepairable, building.id ) } >
                <p>Not Yet Implemented</p>
            </Tab>
        );

        return (
            <div>
                <BuildingInformation
                    options={this.props.options}
                />
                <div>
                    <Tabs>
                        {tabs}
                    </Tabs>
                </div>
            </div>
        );
    }
});

module.exports = Shipyard;
