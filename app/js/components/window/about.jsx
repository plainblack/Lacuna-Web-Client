'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var AboutActions = require('js/actions/window/about');

var ServerRPCStore = require('js/stores/rpc/server');

var CreditsRPCStore = require('js/stores/rpc/stats/credits');

var Tabber = require('js/components/tabber');
var Tab = Tabber.Tab;
var TabList = Tabber.TabList;
var TabPanel = Tabber.TabPanel;
var Tabs = Tabber.Tabs;

var About = React.createClass({

    mixins: [
        Reflux.connect(ServerRPCStore, 'server')
    ],

    render: function() {
        return (
            <div>
                <h1>
                    The Lacuna Expanse
                </h1>

                <p>
                    Copyright 2010, {(new Date()).getFullYear()} Lacuna Expanse Corp.
                </p>
                <p>
                    Server Version: {this.state.server.version}.
                </p>
            </div>
        );
    }
});

var CreditsSection = React.createClass({

    propTypes: {
        header: React.PropTypes.string.isRequired,
        names: React.PropTypes.arrayOf(React.PropTypes.string)
    },

    getDefaultProps: function() {
        return {
            header: '',
            names: []
        };
    },

    render: function() {
        return (
            <div>
                <strong>{this.props.header}</strong>

                <ul>
                    {
                        _.map(this.props.names, function(name) {
                            return (
                                <li
                                    key={name}
                                    style={{
                                        listStyleType: 'disc',
                                        marginLeft: 40
                                    }}>
                                    {name}
                                </li>
                            );
                        })
                    }
                </ul>

                <br />
            </div>
        );
    }
});

var Credits = React.createClass({

    mixins: [
        Reflux.connect(CreditsRPCStore, 'credits')
    ],

    render: function() {
        return (
            <div>
                <h1>
                    Credits
                </h1>

                {
                    _.map(this.state.credits, function(names, header) {
                        return (
                            <CreditsSection
                                key={header}
                                header={header}
                                names={names}
                            />
                        );
                    })
                }
            </div>
        );
    }
});

var AboutWindow = React.createClass({
    statics: {
        windowOptions: {
            title: 'About'
        }
    },

    render: function() {
        return (
            <Tabs
                onSelect={{
                    1: AboutActions.load
                }}
            >
                <TabList>
                    <Tab>About</Tab>
                    <Tab>Credits</Tab>
                </TabList>

                <TabPanel>
                    <About />
                </TabPanel>

                <TabPanel>
                    <Credits />
                </TabPanel>
            </Tabs>
        );
    }
});

module.exports = AboutWindow;
