'use strict';

var React = require('react');
var $ = require('js/hacks/jquery');

var TopBar = require('js/components/menu/topBar');
var BottomBar = require('js/components/menu/bottomBar');

var LeftSidebar = require('js/components/menu/leftSidebar');
var RightSidebar = require('js/components/menu/rightSidebar');
var Map = require('js/components/menu/map');

var Menu = require('js/components/menu');

var AboutWindow = require('js/components/window/about');
var EssentiaWindow = require('js/components/window/essentia');
var InviteWindow = require('js/components/window/invite');
var MailWindow = require('js/components/window/mail');
var NotesWindow = require('js/components/window/notes');
var OptionsWindow = require('js/components/window/options');
var ServerClockWindow = require('js/components/window/serverClock');
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

                { /* One container to rule them all... */ }
                <div className="pusher">

                    <Menu />


                    <Map />
                    <div id="content"></div> { /* This div is used by map. */ }


                    { /* All windows in the game should end up here. */ }
                    <AboutWindow />
                    <EssentiaWindow />
                    <InviteWindow />
                    <MailWindow />
                    <NotesWindow />
                    <OptionsWindow />
                    <ServerClockWindow />
                    <StatsWindow />

                </div>
            </div>
        );
    }
});

module.exports = Window;
