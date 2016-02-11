'use strict';

var React                = require('react');

var SitterManagerActions = require('js/actions/window/sitterManager');

var ReactTabs            = require('react-tabs');
var Tab                  = ReactTabs.Tab;
var Tabs                 = ReactTabs.Tabs;
var TabList              = ReactTabs.TabList;
var TabPanel             = ReactTabs.TabPanel;

var AuthorizeEmpiresTab  = require('js/components/window/sitterManager/authorizeEmpiresTab');
var CurrentSittersTab    = require('js/components/window/sitterManager/currentSittersTab');

var SitterManagerWindow = React.createClass({

    statics : {
        windowOptions : {
            title : 'Manager Sitters'
        }
    },

    onWindowShow : function() {
        SitterManagerActions.load();
    },

    getInitialState : function() {
        return {
            selectedIndex : 0
        };
    },

    handleSelect : function(index) {
        this.setState({
            selectedIndex : index
        });
    },

    render : function() {
        return (
            <Tabs
                selectedIndex={this.state.selectedIndex}
                onSelect={this.handleSelect}
            >
                <TabList>
                    <Tab>Current Sitters</Tab>
                    <Tab>Authorize Empires</Tab>
                </TabList>

                <TabPanel>
                    <CurrentSittersTab />
                </TabPanel>

                <TabPanel>
                    <AuthorizeEmpiresTab />
                </TabPanel>
            </Tabs>
        );
    }
});

module.exports = SitterManagerWindow;
