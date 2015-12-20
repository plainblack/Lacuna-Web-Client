'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var AboutActions = require('js/actions/window/about');

var ServerRPCStore = require('js/stores/rpc/server');
var AboutWindowStore = require('js/stores/window/about');

var CreditsRPCStore = require('js/stores/rpc/stats/credits');

var Panel = require('js/components/panel');

var About = React.createClass({

    mixins: [
        Reflux.connect(ServerRPCStore, 'server')
    ],

    render: function() {
        return (
            <div>
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

    mixins: [
        Reflux.connect(AboutWindowStore, 'show')
    ],

    render: function() {
        return (
            <Panel title="About" onClose={AboutActions.hide} show={this.state.show}>
                <h2>The Lacuna Expanse</h2>
                <About />

                <h2>Credits</h2>
                <Credits />
            </Panel>
        );
    }
});

module.exports = AboutWindow;
