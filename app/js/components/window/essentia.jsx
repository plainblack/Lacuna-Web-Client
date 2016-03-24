'use strict';

var React               = require('react');
var Draggable           = require('react-draggable');

var WindowActions       = require('js/actions/window');
var EmpireRPCActions    = require('js/actions/rpc/empire');

var BoostsTab           = require('js/components/window/essentia/boostsTab');
var GetEssentiaTab      = require('js/components/window/essentia/getEssentiaTab');

var Tabber              = require('js/components/tabber');
var Tabs                = Tabber.Tabs;
var Tab                 = Tabber.Tab;

var Essentia = React.createClass({
    statics : {
        options : {
            title   : 'Essentia',
            width   : 600,
            height  : 350
        }
    },

    closeWindow : function() {
        WindowActions.windowCloseByType('essentia');
    },

    render : function() {
        return (
            <Tabs>
                <Tab title="Boosts" onSelect={EmpireRPCActions.requestEmpireRPCViewBoosts}>
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







