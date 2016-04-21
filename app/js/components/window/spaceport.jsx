'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var GenericBuildingStore    = require('js/stores/genericBuilding.js');
var BodyRPCStore            = require('js/stores/rpc/body');

var WindowActions           = require('js/actions/window');
var BuildingWindowActions   = require('js/actions/windows/building');
var SpacePortRPCActions      = require('js/actions/rpc/spacePort');

var StandardTabs            = require('js/components/window/building/standardTabs');
var BuildingInformation     = require('js/components/window/building/information');
var Tabber                  = require('js/components/tabber');

var Tabs                    = Tabber.Tabs;
var Tab                     = Tabber.Tab;

var SpacePort = React.createClass({
    statics : {
        options : {
            title   : 'SpacePort',
            width   : 700,
            height  : 420
        }
    },
    mixins : [
        Reflux.connect(GenericBuildingStore, 'genericBuildingStore'),
        Reflux.connect(BodyRPCStore, 'bodyStore')
    ],
    componentWillMount : function() {
        BuildingWindowActions.buildingWindowClear();
        SpacePortRPCActions.requestSpacePortRPCView( this.props.options.id );
    },

    closeWindow : function() {
        WindowActions.windowCloseByType('building');
    },

    render : function() {
        var building = this.state.genericBuildingStore;
        var tabs = StandardTabs.tabs(this.props.options, building);
        tabs.push(
            <Tab title="Own Fleets" key="Own Fleets" onSelect={ _.partial(SpacePortRPCActions.requestSpacePortRPCView, building.id ) }>
                <p>Not Yet Implemented! This will show the colonies own ships.</p>
                <p>All the colonies own fleets</p>
                <p>All the colonies travelling fleets</p>
                <p>All excavators (deployed)</p>
                <p>All mining platforms (deployed)</p>
                <p>Fleets can be filtered by tag ('Trade','War', etc.)</p>
                <p>Fleets can be scuttled or cancelled</p>
            </Tab>
        );
        
        tabs.push(
            <Tab title="Foreign Orbiting" key="Foreign Orbiting" >
                <p>Not Yet Implemented</p>
            </Tab>
        );
        tabs.push(
            <Tab title="Battle Logs" key="Battle Logs" >
                <p>Not Yet Implemented</p>
            </Tab>
        );
        tabs.push(
            <Tab title="Send Fleet" key="Send Fleet" >
                <p>Not Yet Implemented</p>
                <p>This will combine the current 'send' and 'fleet' tabs</p>
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

module.exports = SpacePort;
