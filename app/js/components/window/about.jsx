'use strict';

var React           = require('react');
var Draggable       = require('react-draggable');

var PanelHeader     = require('js/components/panel/panelHeader');
var PanelContent    = require('js/components/panel/panelContent');
var AboutTab        = require('js/components/window/about/aboutTab');
var CreditsTab      = require('js/components/window/about/creditsTab');

var StatsRPCActions = require('js/actions/rpc/stats');
var WindowActions   = require('js/actions/window');

var Tabber          = require('js/components/tabber');
var Tabs            = Tabber.Tabs;
var Tab             = Tabber.Tab;

var About = React.createClass({
    statics : {
        options : {
            title   : 'About',
            width   : 450,
            height  : 400
        }
    },

    closeWindow : function() {
        WindowActions.windowClose(About);
    },

    render : function() {
        return (
            <Draggable handle=".drag-handle" zIndex={this.props.zIndex}>
                <div ref="container" style={{
                    position : 'absolute',
                    zIndex   : this.props.zIndex,
                    left     : ($(window.document).width() - About.options.width) / 2
                }}>
                    <PanelHeader
                        title={'About'}
                        panelWidth={About.options.width}
                        onClose={this.closeWindow}
                    />

                    <PanelContent
                        panelWidth={About.options.width}
                        panelHeight={About.options.height}
                    >
                        <Tabs>
                            <Tab title="About">
                                <AboutTab />
                            </Tab>

                            <Tab title="Credits" onSelect={StatsRPCActions.requestStatsRPCGetCredits}>
                                <CreditsTab />
                            </Tab>
                        </Tabs>
                    </PanelContent>
                </div>
            </Draggable>
        );
    }
});

module.exports = About;
