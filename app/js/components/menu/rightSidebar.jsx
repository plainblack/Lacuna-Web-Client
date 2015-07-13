'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');
var $ = require('js/hacks/jquery');

var EmpireRPCStore = require('js/stores/rpc/empire');
var BodyRPCStore = require('js/stores/rpc/body');

var RightSidebarActions = require('js/actions/menu/rightSidebar');
var MapActions = require('js/actions/menu/map');

var PlanetListItem = React.createClass({
    getInitialProps: function() {
        return {
            name: '',
            id: ''
        };
    },
    propTypes: {
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired
    },
    handleClick: function() {
        console.log('Chaning to planet (#' + this.props.id + ').');
        RightSidebarActions.toggle();
        MapActions.changePlanet(this.props.id);
    },
    render: function() {
        return (
            <a className="item" onClick={this.handleClick} style={{
                // For some reason this doesn't get set on the items (by Semantic) when it should.
                cursor: 'pointer'
            }}>
                {this.props.name}
            </a>
        );
    }
});

var BodyList = React.createClass({
    getInitialProps: function() {
        return {
            list: []
        };
    },
    propTypes: {
        list: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    },
    render: function() {
        var list = [];

        _.each(this.props.list, function(planet) {
            list.push(
                <PlanetListItem name={planet.name} id={planet.id} key={planet.id} />
            );
        });

        return <div>{list}</div>;
    }
});

var RightSidebar = React.createClass({
    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire'),
        Reflux.connect(BodyRPCStore, 'body')
    ],

    getInitialState: function() {
        return {
            scrollY: 0
        };
    },

    handleScroll: function(event) {
        this.setState({
            scrollY: $(event.target).scrollTop()
        });
    },

    render: function() {
        return (
            <div className="ui right vertical inverted sidebar menu" onScroll={this.handleScroll}>

                <div className="ui large teal label" ref="planetLabel" style={{
                    position: 'relative',
                    zIndex: 1,
                    top: this.state.scrollY + 'px'
                }}>
                    On <strong>{this.state.body.name}</strong>
                </div>

                <div className="ui horizontal inverted divider">
                    My Colonies
                </div>
                <BodyList list={this.state.empire.colonies} />

                {
                    this.state.empire.stations.length > 0 ?
                        <div>
                            <div className="ui horizontal inverted divider">
                                My Stations
                            </div>
                            <BodyList list={this.state.empire.stations} />
                        </div>
                    :
                        ''
                }
            </div>
        );
    }
});

module.exports = RightSidebar;
