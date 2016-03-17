'use strict';

var React           = require('react');
var Draggable       = require('react-draggable');

var PanelHeader     = require('js/components/panel/panelHeader');
var PanelContent    = require('js/components/panel/panelContent');
var AboutTab        = require('js/components/window/about/aboutTab');
var CreditsTab      = require('js/components/window/about/creditsTab');

var StandardTabsMixin   = require('js/components/mixins/standardTabs');

var BuildingInformation = require('js/components/window/building/information');
var BuildingTabs        = require('js/components/windows/building/buildingTabs');
var DrainTab            = require('js/components/window/essentiavein/drainTab');

var StatsRPCActions = require('js/actions/rpc/stats');
var WindowActions   = require('js/actions/window');

var Tabber                  = require('js/components/tabber');
var Tabs                    = Tabber.Tabs;
var Tab                     = Tabber.Tab;

var EssentiaVein = React.createClass({
    statics : {
        options : {
            title   : 'Essentia Vein',
            width   : 700,
            height  : 420
        }
    },

    closeWindow : function() {
        WindowActions.windowClose(About);
    },

    render : function() {
        var tabs = StandardTabsMixin.tabs(this.props.options);

        return (
            <div>
                <BuildingInformation
                    options={this.props.options}
                />
                <div>
                    <Tabs>
                        {tabs}
                        <DrainTab />
                    </Tabs>
                </div>
            </div>
        );
    }
});

module.exports = EssentiaVein;
