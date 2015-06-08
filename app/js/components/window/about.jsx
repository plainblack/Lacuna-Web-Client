'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var AboutActions = require('js/actions/window/about');

var ServerStore = require('js/stores/server');
var AboutStore = require('js/stores/window/about');
var CreditsStore = require('js/stores/menu/credits');

var Panel = require('js/components/panel');

var About = React.createClass({
    mixins: [Reflux.connect(ServerStore, 'server')],
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

var NamesList = React.createClass({
    propTypes: {
        names: React.PropTypes.arrayOf(React.PropTypes.string)
    },
    render: function() {
        var list = [];

        _.each(this.props.names, function(name) {
            list.push(
                <li key={name} style={{listStyle: 'disc outside none'}}>
                    {name}
                </li>
            );
        });

        return <ul style={{paddingLeft: '20px'}}>{list}</ul>;
    }
});

var Credits = React.createClass({
    mixins: [Reflux.connect(CreditsStore, 'credits')],
    getInitialState: function() {
        return {
            credits: []
        };
    },
    render: function() {
        var credits = [];

        if (this.state.credits.length === 0) {
            AboutActions.load();
        }

        _.each(this.state.credits, function(creditsObject) {
            _.each(creditsObject, function(names, category) {
                credits.push(
                    <li key={category} style={
                            {listStyle: 'decimal outside none'}}>
                        {category}
                        <NamesList names={names} />
                    </li>
                );
            });
        });

        return <ol style={{paddingLeft: '40px'}}>{credits}</ol>;
    }
});

var AboutWindow = React.createClass({
    mixins: [Reflux.connect(AboutStore, 'show')],
    getInitialState: function() {
        return {
            show: false
        }
    },
    render: function() {
        if (this.state.show) {
            return (
                <Panel title="About" height={400} onClose={AboutActions.hide}
                    display={this.state.display}>
                    <h2>The Lacuna Expanse</h2>
                    <About />

                    <br />

                    <h2>Credits</h2>
                    <Credits credits={this.state.credits} />
                </Panel>
            );
        } else {
            return <div></div>;
        }
    }
});

module.exports = AboutWindow;
