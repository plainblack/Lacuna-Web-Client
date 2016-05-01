'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var WindowActions           = require('js/actions/window');
var EmpireRPCActions        = require('js/actions/rpc/empire');

var SessionStore            = require('js/stores/session');
var EmpireRPCStore          = require('js/stores/rpc/empire');
var BoostsEmpireRPCStore    = require('js/stores/rpc/empire/boosts');

var BoostsTab               = require('js/components/window/essentia/boostsTab');
var GetEssentiaTab          = require('js/components/window/essentia/getEssentiaTab');

var Tabber                  = require('js/components/tabber');
var Tabs                    = Tabber.Tabs;
var Tab                     = Tabber.Tab;

var Essentia = React.createClass({
    mixins : [
        Reflux.connect(EmpireRPCStore,          'empireStore'),
        Reflux.connect(BoostsEmpireRPCStore,    'boostsStore'),
        Reflux.connect(SessionStore,            'session')
    ],

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
                    <BoostsTab 
                        essentia={this.state.empireStore.essentia} 
                        exactEssentia={this.state.empireStore.exactEssentia}
                        boosts={this.state.boostsStore}
                    />
                </Tab>

                <Tab title="Get More Essentia">
                    <GetEssentiaTab session={this.state.session} />
                </Tab>
            </Tabs>
        );
    }
});

module.exports = Essentia;







