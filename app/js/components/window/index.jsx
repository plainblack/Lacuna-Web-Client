'use strict';

var React = require('react');
var $ = require('js/shims/jquery');

var ReactTooltip = require('react-tooltip');

var TopBar = require('js/components/menu/topBar');
var BottomBar = require('js/components/menu/bottomBar');

var LeftSidebar = require('js/components/menu/leftSidebar');
var RightSidebar = require('js/components/menu/rightSidebar');
var Map = require('js/components/menu/map');

var Menu = require('js/components/menu');

var WindowManager = require('js/components/menu/windowManager');

var MailWindow = require('js/components/window/mail');
var OptionsWindow = require('js/components/window/options');
var StatsWindow = require('js/components/window/stats');

// This React component will be the main container of everything that appears on the screen.

var Window = React.createClass({
    render: function() {
        return (
            <div>
                { /*
                    Semantic UI requires this structure for Sidebars to work.
                    See: http://semantic-ui.com/modules/sidebar.html#/usage
                 */ }
                <LeftSidebar />
                <RightSidebar />

                { /*
                    This sets all the tooltips in the entire client.
                    See http://npmjs.org/package/react-tooltip for usage.
                */ }
                <ReactTooltip
                    effect="solid"
                    place="bottom"
                    type="dark"
                />

                { /* One container to rule them all... */ }
                <div className="pusher">

                    <Menu />


                    <Map />
                    <div id="content"></div> { /* This div is used by map. */ }


                    <WindowManager />

                    <MailWindow />
                    <OptionsWindow />
                    <StatsWindow />

                </div>
            </div>
        );
    }
});

module.exports = Window;
