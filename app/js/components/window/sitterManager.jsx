'use strict';

var React                = require('react');

var SitterManagerActions = require('js/actions/windows/sitterManager');

var Tabber               = require('js/components/tabber');
var Tabs                 = Tabber.Tabs;
var Tab                  = Tabber.Tab;

var AuthorizeEmpiresTab  = require('js/components/windows/sitterManager/authorizeEmpiresTab');
var CurrentSittersTab    = require('js/components/windows/sitterManager/currentSittersTab');

var SitterManagerWindow = React.createClass({

    statics : {
        options : {
            title   : 'Manage Sitters',
            width   : 450,
            height  : 400
        }
    },

    render : function() {
        return (
            <Tabs>
                <Tab title="Current Sitters" onSelect={SitterManagerActions.load}>
                    <CurrentSittersTab />
                </Tab>

                <Tab title="Authorize Empires">
                    <AuthorizeEmpiresTab />
                </Tab>
            </Tabs>
        );
    }
});

module.exports = SitterManagerWindow;
