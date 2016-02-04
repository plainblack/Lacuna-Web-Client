'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash')
var $ = require('js/shims/jquery');

var SitterManagerActions = require('js/actions/window/sitterManager');

var SittersRPCStore = require('js/stores/rpc/empire/sitters');

var Panel = require('js/components/panel');

var ReactTabs = require('react-tabs');
var ReactTooltip = require('react-tooltip');
var Tab = ReactTabs.Tab;
var Tabs = ReactTabs.Tabs;
var TabList = ReactTabs.TabList;
var TabPanel = ReactTabs.TabPanel;

var vex = require('js/vex');

var AuthorizeEmpires = React.createClass({

    authorizeAllies: function() {
        vex.confirm({
            message: 'Are you sure you want to authorize all members of your alliance?',
            callback: function(value) {
                if (value) {
                    SitterManagerActions.authorizeAllies();
                }
            }
        });
    },

    authorizeAlliance: function() {
        var name = this.refs.alliance.getDOMNode().value;

        vex.confirm({
            message: 'Are you sure you want to authorize all members of ' + name + '?',
            callback: function(value) {
                if (value) {
                    SitterManagerActions.authorizeAlliance(name);
                }
            }
        });
    },

    authorizeEmpire: function() {
        var name = this.refs.empire.getDOMNode().value;

        vex.confirm({
            message: 'Are you sure you want to authorize ' + name + '?',
            callback: function(value) {
                if (value) {
                    SitterManagerActions.authorizeEmpire(name);
                }
            }
        });
    },

    render: function() {
        return (
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

    reauthorize: function() {
        SitterManagerActions.authorizeEmpire(this.props.sitter.name)
    },

    deauthorize: function() {
        var s = this.props.sitter;

        vex.confirm({
            message: 'Are you sure you want to remove ' + s.name + "'s access to your empire?",
            callback: function(value) {
                if (value) {
                    SitterManagerActions.deauthorizeEmpire(s.id);
                }
            }
        });
    },

    render: function() {
        return (
            <div className="item">
                <div className="ui right floated compact buttons">
                    <div className="ui green button" onClick={this.reauthorize}>
                        Renew
                    </div>
                    <div className="ui red button" onClick={this.deauthorize}>
                        Revoke
                    </div>
                </div>

                <div className="content aligned">
                    <div className="header" style={{color: '#ffffff'}}>
                        {this.props.sitter.name}
                    </div>

                    Expires {this.props.sitter.ends}
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
        SitterManagerActions.reauthorizeAll();
    },

    deauthorizeAll: function() {
        vex.confirm({
            message: "Are you sure you want to revoke everyone's access to your empire?",
            callback: function(value) {
                if (value) {
                    SitterManagerActions.deauthorizeAll();
                }
            }
        });
    },

    render: function() {
        return (
            <div>

                <div className="ui grid">
                    <div className="centered row">
                        <div className="ui large icon buttons">
                            <div className="ui green button" onClick={this.reauthorizeAll}>
                                <i className="refresh icon"></i>
                                Renew all
                            </div>
                            <div className="ui red button" onClick={this.deauthorizeAll}>
                                <i className="warning sign icon"></i>
                                Revoke all
                            </div>
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

var SitterManagerWindow = React.createClass({

    statics: {
        windowOptions: {
            title: 'Manager Sitters'
        }
    },

    onWindowShow: function() {
        SitterManagerActions.load();
    },

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
        );
    }
});

module.exports = SitterManagerWindow;
