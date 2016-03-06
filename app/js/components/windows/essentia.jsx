'use strict';

var React           = require('react');

var Tabber          = require('js/components/tabber');
var Tabs            = Tabber.Tabs;
var Tab             = Tabber.Tab;

var EssentiaActions = require('js/actions/windows/essentia');

var BoostsTab       = require('js/components/windows/essentia/boostsTab');
var GetEssentiaTab  = require('js/components/windows/essentia/getEssentiaTab');

var EssentiaWindow = React.createClass({
    statics : {
        windowOptions : {
            title  : 'Essentia',
            width  : 600,
            height : 350
        }
    },

    render : function() {
        return (
            <Tabs>
                <Tab title="Boosts" onSelect={EssentiaActions.loadBoosts}>
                    <BoostsTab />
                </Tab>

                <Tab title="Get More Essentia">
                    <GetEssentiaTab />
                </Tab>
            </Tabs>
        );
    }
});

module.exports = EssentiaWindow;
