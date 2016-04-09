'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var GenericBuildingStore    = require('js/stores/genericBuilding.js');

var WindowActions           = require('js/actions/window');
var BuildingWindowActions   = require('js/actions/windows/building');
var ShipyardRPCActions      = require('js/actions/rpc/shipyard');

var StandardTabs            = require('js/components/window/building/standardTabs');
var BuildingInformation     = require('js/components/window/building/information');
var BuildFleetTab           = require('js/components/window/shipyard/buildFleetTab');
var BuildQueueTab           = require('js/components/window/shipyard/buildQueueTab');

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
            <Tab title="Build Queue" key="Build Queue" >
                <BuildQueueTab buildingId={building.id} />
            </Tab>
        );
        
        tabs.push(
            <Tab title="Build Ships" key="Build Ships" onSelect={ _.partial(ShipyardRPCActions.requestShipyardRPCGetBuildable, building.id ) } >
                <BuildFleetTab buildingId={building.id} />
            </Tab>
        );

        tabs.push(
            <Tab title="Repair Ships" key="Repair Ships" >
                <p>Not Yet Implemented</p>
                <p>Fleets of ships damaged in an attack can be repaired (at less cost than building from scratch</p>
            </Tab>
        );

        tabs.push(
            <Tab title="Refit Ships" key="Refit Ships" >
                <p>Not Yet Implemented</p>
                <p>Fleets of ships will be able to be upgraded to the empires current spec.</p>
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
