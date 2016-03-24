'use strict';

var React           = require('react');
var Draggable       = require('react-draggable');

var AboutTab        = require('js/components/window/about/aboutTab');
var CreditsTab      = require('js/components/window/about/creditsTab');

var StatsRPCActions = require('js/actions/rpc/stats');
var WindowActions   = require('js/actions/window');

var Tabber          = require('js/components/tabber');
var Tabs            = Tabber.Tabs;
var Tab             = Tabber.Tab;

var AboutWindow = React.createClass({
    statics : {
        options : {
            title   : 'About',
            width   : 450,
            height  : 400
        }
    },

    closeWindow : function() {
        WindowActions.windowCloseByType('about');
    },

    render : function() {
        return (
            <Tabs>
                <Tab title="About">
                    <AboutTab />
                </Tab>

                <Tab title="Credits" onSelect={StatsRPCActions.requestStatsRPCGetCredits}>
                    <CreditsTab />
                </Tab>
            </Tabs>
        );
    }
});

module.exports = AboutWindow;
