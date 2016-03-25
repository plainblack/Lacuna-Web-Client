'use strict';

var React                = require('react');
var Reflux               = require('reflux');

var SitterManagerActions = require('js/actions/windows/sitterManager');

var SittersEmpireRPCStore   = require('js/stores/rpc/empire/sitters');

var Tabber               = require('js/components/tabber');
var Tabs                 = Tabber.Tabs;
var Tab                  = Tabber.Tab;

var AuthorizeEmpiresTab  = require('js/components/window/sitterManager/authorizeEmpiresTab');
var CurrentSittersTab    = require('js/components/window/sitterManager/currentSittersTab');

var SitterManagerWindow = React.createClass({
    mixins : [
        Reflux.connect(SittersEmpireRPCStore, 'sitters')
    ],

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
                    <CurrentSittersTab sitters={this.state.sitters} />
                </Tab>

                <Tab title="Authorize Empires">
                    <AuthorizeEmpiresTab />
                </Tab>
            </Tabs>
        );
    }
});

module.exports = SitterManagerWindow;
