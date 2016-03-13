'use strict';

var React           = require('react');
var Draggable       = require('react-draggable');

var PanelHeader  = require('js/components/panel/panelHeader');
var PanelContent = require('js/components/panel/panelContent');

var StatsRPCActions = require('js/actions/rpc/stats');

var Tabber          = require('js/components/tabber');
var Tabs            = Tabber.Tabs;
var Tab             = Tabber.Tab;

var AboutWindow = React.createClass({
    statics : {
        options : {
            title   : 'About',
            width   : 450,
            height  : 400
        }
    },

    render : function() {
        return (
            <Draggable handle=".drag-handle" zIndex={this.props.zIndex}>
                <div ref="container" style={{
                    position : 'absolute',
                    zIndex   : this.props.zIndex,
                    left     : ($(window.document).width() - AboutWindow.options.width) / 2
                }}>
                    <PanelHeader
                        title={'About'}
                        panelWidth={AboutWindow.options.width}
                        onClose={this.props.onClose}
                    />

                    <PanelContent
                        panelWidth={AboutWindow.options.width}
                        panelHeight={AboutWindow.options.height}
                    >
                        <Tabs>
                            <Tab title="About">
                                <div><p>This is the about which is as wide as it needs to be and no more.</p></div>
                            </Tab>

                            <Tab title="Credits" onSelect={StatsRPCActions.requestStatsGetCredits}>
                                <div><p>This is the about</p></div>
                            </Tab>
                        </Tabs>
                    </PanelContent>
                </div>
            </Draggable>
        );
    }
});

module.exports = AboutWindow;
