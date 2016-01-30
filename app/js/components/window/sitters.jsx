'use strict';

var React = require('react');
var Reflux = require('reflux');

var SittersActions = require('js/actions/window/sitters');

var SittersWindowStore = require('js/stores/window/sitters');
var SittersRPCStore = require('js/stores/rpc/empire/sitters');

var Panel = require('js/components/panel');

var ReactTabs = require('react-tabs');
var ReactTooltip = require('react-tooltip');
var Tab = ReactTabs.Tab;
var Tabs = ReactTabs.Tabs;
var TabList = ReactTabs.TabList;
var TabPanel = ReactTabs.TabPanel;

var AddSitters = React.createClass({
    render: function() {
        return (
            <div>
                This is the screen to add sitters.
            </div>
        )
    }
})

var AuthorizedSitters = React.createClass({
    mixins: [
        Reflux.connect(SittersRPCStore, 'sitters')
    ],

    render: function() {
        return (
            <div>
                <h1>Authorized sitters:</h1>
                <p>
                    {JSON.stringify(this.state.sitters, null, 2)}
                </p>
            </div>
        )
    }
})

var SittersWindow = React.createClass({

    mixins: [
        Reflux.connect(SittersWindowStore, 'show')
    ],

    getInitialState: function() {
        return {
            selectedIndex: 0
        };
    },

    handleSelect: function(index) {
        this.setState({
            selectedIndex: index
        });
    },

    render: function() {
        return (
            <Panel
                title="Manage Sitters"
                onClose={SittersActions.hide}
                show={this.state.show}
            >
                <Tabs
                    selectedIndex={this.state.selectedIndex}
                    onSelect={this.handleSelect}
                >
                    <TabList>
                        <Tab>Authorized Sitters</Tab>
                        <Tab>Add Sitters</Tab>
                    </TabList>

                    <TabPanel>
                        <AuthorizedSitters />
                    </TabPanel>

                    <TabPanel>
                        <AddSitters />
                    </TabPanel>
                </Tabs>
            </Panel>
        );
    }
});

module.exports = SittersWindow;
