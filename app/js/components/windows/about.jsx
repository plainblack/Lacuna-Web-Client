'use strict';

var React           = require('react');

var RpcStatsActions = require('js/actions/rpc/stats');

var Tabber          = require('js/components/tabber');
var Tabs            = Tabber.Tabs;
var Tab             = Tabber.Tab;

var AboutTab        = require('js/components/windows/about/aboutTab');
var CreditsTab      = require('js/components/windows/about/creditsTab');

var AboutWindow = React.createClass({
    statics : {
        windowOptions : {
            title : 'About'
        }
    },

    render : function() {
        return (
            <Tabs>
                <Tab title="About">
                    <AboutTab />
                </Tab>

                <Tab title="Credits" onSelect={RpcStatsActions.requestGetCredits}>
                    <CreditsTab />
                </Tab>
            </Tabs>
        );
    }
});

module.exports = AboutWindow;
