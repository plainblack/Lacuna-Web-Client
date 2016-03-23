'use strict';

var React           = require('react');
var Draggable       = require('react-draggable');

var WindowActions   = require('js/actions/window');
var EssentiaActions = require('js/actions/windows/essentia');

var BoostsTab       = require('js/components/window/essentia/boostsTab');
var GetEssentiaTab  = require('js/components/window/essentia/getEssentiaTab');

var Tabber          = require('js/components/tabber');
var Tabs            = Tabber.Tabs;
var Tab             = Tabber.Tab;

var Essentia = React.createClass({
    statics : {
        options : {
            title   : 'Essentia',
            width   : 600,
            height  : 350
        }
    },

    closeWindow : function() {
        WindowActions.windowClose(Essentia);
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

module.exports = Essentia;







