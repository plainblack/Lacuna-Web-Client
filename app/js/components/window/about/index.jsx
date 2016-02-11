'use strict';

var React        = require('react');

var AboutActions = require('js/actions/window/about');

var Tabber       = require('js/components/tabber');
var Tab          = Tabber.Tab;
var TabList      = Tabber.TabList;
var TabPanel     = Tabber.TabPanel;
var Tabs         = Tabber.Tabs;

var AboutTab     = require('js/components/window/about/about');
var CreditsTab   = require('js/components/window/about/credits');

var AboutWindow = React.createClass({
    statics : {
        windowOptions : {
            title : 'About'
        }
    },

    render : function() {
        return (
            <Tabs
                onSelect={{
                    1 : AboutActions.load
                }}
            >
                <TabList>
                    <Tab>About</Tab>
                    <Tab>Credits</Tab>
                </TabList>

                <TabPanel>
                    <AboutTab />
                </TabPanel>

                <TabPanel>
                    <CreditsTab />
                </TabPanel>
            </Tabs>
        );
    }
});

module.exports = AboutWindow;
