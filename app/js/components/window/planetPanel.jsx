'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var GetBodyStatusRPCStore   = require('js/stores/rpc/body/getBodyStatus');

var WindowActions           = require('js/actions/window');
var BodyRPCActions          = require('js/actions/rpc/body');

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
        Reflux.connect(GetBodyStatusRPCStore, 'getBodyStatusStore')
    ],
    componentWillMount : function() {
        BodyRPCActions.requestBodyRPCGetBodyStatus( { bodyId : this.props.options.data.id } );
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
