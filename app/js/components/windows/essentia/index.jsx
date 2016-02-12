'use strict';

var React           = require('react');

var Tabber          = require('js/components/tabber');
var Tab             = Tabber.Tab;
var TabList         = Tabber.TabList;
var TabPanel        = Tabber.TabPanel;
var Tabs            = Tabber.Tabs;

var EssentiaActions = require('js/actions/windows/essentia');

var BoostsTab       = require('js/components/windows/essentia/boostsTab');
var GetEssentiaTab  = require('js/components/windows/essentia/getEssentiaTab');

var EssentiaWindow = React.createClass({
    statics : {
        windowOptions : {
            title : 'Essentia',
            width : 600
        }
    },

    render : function() {
        return (
            <Tabs
                onSelect={{
                    0 : EssentiaActions.loadBoosts
                }}
            >
                <TabList>
                    <Tab>Boosts</Tab>
                    <Tab>Get More Essentia</Tab>
                </TabList>

                <TabPanel>
                    <BoostsTab />
                </TabPanel>

                <TabPanel>
                    <GetEssentiaTab />
                </TabPanel>
            </Tabs>
        );
    }
});

module.exports = EssentiaWindow;
