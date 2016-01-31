'use strict';

var React               = require('react');
var $                   = require('js/shims/jquery');
var ReactTooltip        = require('react-tooltip');

var TopBar              = require('js/components/menu/topBar');
var BottomBar           = require('js/components/menu/bottomBar');
var LeftSidebar         = require('js/components/menu/leftSidebar');
var RightSidebar        = require('js/components/menu/rightSidebar');
var Map                 = require('js/components/menu/map');
var Menu                = require('js/components/menu');
var WindowManager       = require('js/components/menu/windowManager');

var AboutWindow         = require('js/components/window/about');
var EssentiaWindow      = require('js/components/window/essentia');
var InviteWindow        = require('js/components/window/invite');
var MailWindow          = require('js/components/window/mail');
var NotesWindow         = require('js/components/window/notes');
var OptionsWindow       = require('js/components/window/options');
var PromotionsWindow    = require('js/components/window/promotions');
var StatsWindow         = require('js/components/window/stats');

// This React component will be the main container of everything that appears on the screen.

var Window = React.createClass({
    render: function() {
        return (
            <div
                id="sidebarContainer"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
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

                    <MailWindow />
                    <OptionsWindow />
                    <StatsWindow />
                </div>
            </div>
        );
    }
});

module.exports = Window;
