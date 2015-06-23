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
    mixins: [
        Reflux.connect(CreditsRPCStore, 'credits')
    ],
    componentDidUpdate: function() {
        if (this.state.credits.length === 0) {
            AboutActions.load();
        }
    },
    render: function() {
        var credits = [];

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
    mixins: [
        Reflux.connect(AboutWindowStore, 'show')
    ],
    render: function() {
        return (
            <Panel title="About" height={400} onClose={AboutActions.hide} show={this.state.show}>

                <h2>The Lacuna Expanse</h2>
                <About />

                <br />

                <h2>Credits</h2>
                <Credits credits={this.state.credits} />

            </Panel>
        );
    }
});

module.exports = AboutWindow;
