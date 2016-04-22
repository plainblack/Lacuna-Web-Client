'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var BodyRPCStore            = require('js/stores/rpc/body');

var WindowActions           = require('js/actions/window');

var StandardTabs            = require('js/components/window/building/standardTabs');
var Tabber                  = require('js/components/tabber');

var Tabs                    = Tabber.Tabs;
var Tab                     = Tabber.Tab;

var PlanetPanel = React.createClass({
    statics : {
        options : {
            title   : 'Planet Details',
            width   : 700,
            height  : 420
        }
    },
    mixins : [
        //Reflux.connect(GenericBuildingStore, 'genericBuildingStore'),
    ],
    componentWillMount : function() {
    },

    closeWindow : function() {
        WindowActions.windowCloseByType('planetPanel');
    },

    render : function() {
        var tabs = [];
        tabs.push(
            <Tab title="Planet Details" key="Planet Details" >
                <p>Not Yet Implemented!</p>
            </Tab>
        );
        
        tabs.push(
            <Tab title="My Fleets" key="My Fleets" >
                <p>Not Yet Implemented</p>
            </Tab>
        );
        tabs.push(
            <Tab title="Foreign Fleets" key="Foreign Fleets" >
                <p>Not Yet Implemented</p>
            </Tab>
        );
        return (
            <div>
                <div>
                    <Tabs>
                        {tabs}
                    </Tabs>
                </div>
            </div>
        );
    }
});

module.exports = PlanetPanel;
