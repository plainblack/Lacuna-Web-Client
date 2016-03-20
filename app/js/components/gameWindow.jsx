'use strict';

var React         = require('react');
var ReactTooltip  = require('react-tooltip');

var LeftSidebar   = require('js/components/menu/leftSidebar');
var RightSidebar  = require('js/components/menu/rightSidebar');
var Map           = require('js/components/menu/map');
var Menu          = require('js/components/menu');
var WindowManager = require('js/components/windowManager');

var MailWindow    = require('js/components/window/mail');
var OptionsWindow = require('js/components/window/options');
var StatsWindow   = require('js/components/window/stats');

// This React component will be the main container of everything that appears on the screen.

var GameWindow = React.createClass({
    render : function() {
        return (
            <div
                id="sidebarContainer"
                style={{
                    position : 'fixed',
                    top      : 0,
                    left     : 0,
                    width    : '100%',
                    height   : '100%'
                }}
            >

                <LeftSidebar />
                <RightSidebar />

                { /* One container to rule them all... */ }
                <div className="pusher">

                    { /*
                        This sets all the tooltips in the entire client.
                        See http://npmjs.org/package/react-tooltip for usage.
                    */ }
                    <ReactTooltip
                        effect="solid"
                        place="bottom"
                        type="dark"
                    />

                    <Menu />

                    <Map />
                    <div id="content"></div> { /* This div is used by map. */ }

                    <WindowManager />
                    <WindowsManager />

                    <MailWindow />
                    <OptionsWindow />
                    <StatsWindow />
                </div>
            </div>
        );
    }
});

module.exports = GameWindow;
