'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var ReactPanels = require('react-panels');
var FloatingPanel = ReactPanels.FloatingPanel;
var Tab = ReactPanels.Tab;
var Content = ReactPanels.Content;
var Footer = ReactPanels.Footer;

var Game = YAHOO.lacuna.Game;
var AboutStore = require('js/stores/menu/about');
var CreditsStore = require('js/stores/menu/credits');
var AboutActions = require('js/actions/menu/about');

var About = React.createClass({
    render: function() {
        return (
            <div>
                <p>
                    Copyright {this.props.date.getFullYear()} Lacuna Expanse Corp.
                </p>
                <p>
                    Server Version: {Game.ServerData.version}.
                </p>
            </div>
        );
    }
});

var NamesList = React.createClass({
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
            <FloatingPanel theme="flexbox"
                style={{zIndex: '9999999999', display: this.state.display}}>
                <Tab title="About">
                    <Content>
                        <div style={{overflow: 'auto', height: '400px'}}>
                            <h2>The Lacuna Expanse</h2>
                            <About date={this.props.date} />

                            <br />

                            <h2>Credits</h2>
                            <Credits credits={this.state.credits} />
                        </div>
                    </Content>
                    <Footer>
                        <button type="button" onClick={this.handleClose}>Close</button>
                    </Footer>
                </Tab>
            </FloatingPanel>
        );
    }
});

module.exports = AboutWindow;
