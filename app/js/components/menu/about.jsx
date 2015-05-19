'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var Game = YAHOO.lacuna.Game;
var AboutStore = require('js/stores/menu/about');
var CreditsStore = require('js/stores/menu/credits');
var AboutActions = require('js/actions/menu/about');

var Panel = require('js/components/panel');

var About = React.createClass({
    propTypes: {
        date: React.PropTypes.instanceOf(Date).isRequired,
        serverVersion: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]).isRequired
    },
    render: function() {
        return (
            <div>
                <p>
                    Copyright {this.props.date.getFullYear()} Lacuna Expanse Corp.
                </p>
                <p>
                    Server Version: {this.props.serverVersion}.
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
    mixins: [Reflux.connect(AboutStore, 'display')],
    getInitialState: function() {
        return {
            display: 'none'
        }
    },
    handleClose: function() {
        AboutActions.close();
    },
    render: function() {
        return (
            <Panel title="About" height={400} onClose={this.handleClose}
                display={this.state.display}>
                <h2>The Lacuna Expanse</h2>
                <About date={this.props.date} serverVersion={Game.ServerData.version} />

                <br />

                <h2>Credits</h2>
                <Credits credits={this.state.credits} />
            </Panel>
        );
    }
});

module.exports = AboutWindow;
