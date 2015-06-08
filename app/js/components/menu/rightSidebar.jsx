'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var EmpireStore = require('js/stores/empire');

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
        name: React.PropTypes.string,
        id: React.PropTypes.string
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

var PlanetList = React.createClass({
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
        Reflux.connect(EmpireStore, 'empire')
    ],
    render: function() {
        return (
            <div className="ui right vertical inverted sidebar menu">

                <div className="ui horizontal inverted divider">
                    My Colonies
                </div>
                <PlanetList list={this.state.empire.colonies} />

                {
                    this.state.empire.stations.length > 0 ?
                        <div>
                            <div className="ui horizontal inverted divider">
                                My Stations
                            </div>
                            <PlanetList list={this.state.empire.stations} />
                        </div>
                    :
                        ''
                }
            </div>
        );
    }
});

module.exports = RightSidebar;
