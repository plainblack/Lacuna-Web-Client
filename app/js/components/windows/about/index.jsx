'use strict';

var React        = require('react');

var AboutActions = require('js/actions/windows/about');

var Tabber       = require('js/components/tabber');
var Tabs         = Tabber.Tabs;
var Tab          = Tabber.Tab;

var AboutTab     = require('js/components/windows/about/about');
var CreditsTab   = require('js/components/windows/about/credits');

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

                <Tab title="Credits" onSelect={AboutActions.load}>
                    <CreditsTab />
                </Tab>
            </Tabs>
        );
    }
});

module.exports = AboutWindow;
