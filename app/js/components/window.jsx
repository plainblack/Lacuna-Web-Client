'use strict';

var React = require('react');

var TopBar = require('js/components/menu/topBar');
var BottomBar = require('js/components/menu/bottomBar');

var Menu = require('js/components/window/menu');

var AboutWindow = require('js/components/window/about');
var EssentiaWindow = require('js/components/window/essentia');
var MailWindow = require('js/components/window/mail');
var StatsWindow = require('js/components/window/stats');


// This React component will be the main container of everything that appears on the screen.

var Window = React.createClass({
    render: function() {
        return (
            <div>

                <Menu />

                {
                    // All windows in the game should end up here.
                }
                <AboutWindow />
                <EssentiaWindow />
                <MailWindow />
                <StatsWindow />

            </div>
        );
    }
});

module.exports = Window;
