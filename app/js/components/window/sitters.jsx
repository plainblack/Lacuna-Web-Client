'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash')
var $ = require('js/shims/jquery');

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

var AuthorizeEmpires = React.createClass({

    authorizeAllies: function() {
        if (confirm('Are you sure you want to authorize all members of your alliance?')) {
            SittersActions.authorizeAllies();
        }
    },

    authorizeAlliance: function() {
        var value = this.refs.alliance.getDOMNode().value;

        if (confirm('Are you sure you want to authorize all members of ' + value + '?')) {
            SittersActions.authorizeAlliance(value);
        }
    },

    authorizeEmpire: function() {
        var value = this.refs.empire.getDOMNode().value;

        if (confirm('Are you sure you want to authorize ' + value + '?')) {
            SittersActions.authorizeEmpire(value);
        }
    },

    render: function() {
        return (
            <div>
                <div>
                    <h2 className="ui yellow header">
                        <div className="content">
                            Authorized empires
                            <div className="sub header" style={{color: '#ffffff'}}>
                                can do anything in your empire except for:
                            </div>
                        </div>
                    </h2>

                    <ul
                        style={{
                            fontSize: '1.2em',
                            padding: '0 40px'
                        }}
                    >
                        <li style={{listStyle: 'disc'}}>reading your mail</li>
                        <li style={{listStyle: 'disc'}}>colonizing or abandoning planets</li>
                    </ul>
                </div>

                <br />

                <div style={{textAlign: 'center'}}>
                    <div
                        className="ui green large labeled icon button"
                        onClick={this.authorizeAllies}
                        >
                        <i className="warning sign icon"></i>
                        Authorize all Empires in current alliance
                    </div>

                    <h3>OR</h3>

                    <div className="ui large fluid action input">
                        <input type="text" placeholder="Alliance name" ref="alliance" />
                        <div className="ui green button" onClick={this.authorizeAlliance}>
                            Authorize
                        </div>
                    </div>

                    <h3>OR</h3>

                    <div className="ui large fluid action input">
                        <input type="text" placeholder="Empire name" ref="empire" />
                        <div className="ui green button" onClick={this.authorizeEmpire}>
                            Authorize
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

var SitterListItem = React.createClass({

    propTypes: {
        sitter: React.PropTypes.object
    },

    getDefaultProps: function() {
        return {
            sitter: {}
        };
    },

    deauthorize: function() {
        var s = this.props.sitter;
        var msg = 'Are you sure you want to remove ' + s.name + "'s access to your empire?";

        if (confirm(msg)) {
            SittersActions.deauthorizeEmpire(s.id);
        }
    },

    render: function() {
        return (
            <div className="item">
                <div className="right floated compact ui red button" onClick={this.deauthorize}>
                    Deauthorize
                </div>

                <div className="content aligned">
                    <div className="header" style={{color: '#ffffff'}}>
                        {this.props.sitter.name}
                    </div>

                    Expires: {this.props.sitter.expiry}
                </div>
            </div>
        );
    }
})

var CurrentSitters = React.createClass({
    mixins: [
        Reflux.connect(SittersRPCStore, 'sitters')
    ],

    reauthorizeAll: function() {
        SittersActions.reauthorizeAll();
    },

    render: function() {
        return (
            <div>

                <div className="ui grid">
                    <div className="centered row">
                        <div
                            className="ui large green compact icon button"
                            onClick={this.reauthorizeAll}
                        >
                            <i className="refresh icon"></i>
                            Reauthorize all Empires
                        </div>
                    </div>
                </div>

                <div
                    className="ui divided list"
                    style={{
                        marginTop: 20
                    }}
                >
                    {
                        _.map(this.state.sitters, function(sitter) {
                            return <SitterListItem sitter={sitter} />;
                        })
                    }
                </div>
            </div>
        )
    }
});

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
                        <Tab>Current Sitters</Tab>
                        <Tab>Authorize Empires</Tab>
                    </TabList>

                    <TabPanel>
                        <CurrentSitters />
                    </TabPanel>

                    <TabPanel>
                        <AuthorizeEmpires />
                    </TabPanel>
                </Tabs>
            </Panel>
        );
    }
});

module.exports = SittersWindow;
