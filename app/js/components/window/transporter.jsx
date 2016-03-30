'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var GenericBuildingStore    = require('js/stores/genericBuilding.js');
var BodyRPCStore            = require('js/stores/rpc/body');

var WindowActions           = require('js/actions/window');
var BuildingWindowActions   = require('js/actions/windows/building');
var TransporterRPCActions   = require('js/actions/rpc/transporter');

var StandardTabs            = require('js/components/window/building/standardTabs');
var BuildingInformation     = require('js/components/window/building/information');
var Tabber                  = require('js/components/tabber');

var Tabs                    = Tabber.Tabs;
var Tab                     = Tabber.Tab;

var Transporter = React.createClass({
    statics : {
        options : {
            title   : 'Transporter',
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
        TransporterRPCActions.requestTransporterRPCView( this.props.options.id );
    },

    closeWindow : function() {
        WindowActions.windowCloseByType('building');
    },

    render : function() {
        var building = this.state.genericBuildingStore;
        var tabs = StandardTabs.tabs(this.props.options, this.state.bodyStore, building);
        
        tabs.push(
            <Tab title="One For One" key="One For One" >
                <p>Not Yet Implemented</p>
            </Tab>
        );
        tabs.push(
            <Tab title="Push" key="Push" >
                <p>Not Yet Implemented</p>
            </Tab>
        );
        tabs.push(
            <Tab title="Available Trades" key="Available Trades" >
                <p>Not Yet Implemented</p>
            </Tab>
        );

        tabs.push(
            <Tab title="My Trades" key="My Trades" >
                <p>Not Yet Implemented</p>
            </Tab>
        );

        tabs.push(
            <Tab title="Add Trade" key="Add Trade" >
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

module.exports = Transporter;
