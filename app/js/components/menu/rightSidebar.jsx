'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var classNames = require('classnames');

var EmpireRPCStore = require('js/stores/rpc/empire');
var BodyRPCStore = require('js/stores/rpc/body');

var RightSidebarActions = require('js/actions/menu/rightSidebar');
var MapActions = require('js/actions/menu/map');

var PlanetListItem = React.createClass({

    propTypes: {
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        current: React.PropTypes.string.isRequired
    },

    getInitialProps: function() {
        return {
            name: '',
            id: '',
            current: '',
        };
    },

    // Returns true if this list item is the the currently selected planet.
    isCurrentWorld: function() {
        return this.props.current === this.props.id
    },

    handleClick: function() {
        RightSidebarActions.toggle();

        if (this.isCurrentWorld()) {
            YAHOO.lacuna.MapPlanet.Refresh()
        } else {
            console.log('Changing to planet (#' + this.props.id + ').');
            MapActions.changePlanet(this.props.id);
        }
    },

    render: function() {
        var classStr = classNames({
            'ui large teal label': this.isCurrentWorld(),
            'item': !this.isCurrentWorld()
        });

        return (
            <a className={classStr} onClick={this.handleClick} style={{
                // For some reason this doesn't get set on the items (by Semantic) when it should.
                cursor: 'pointer'
            }}>
                {this.props.name} ({this.props.zone})
            </a>
        );
    }
});

var BodyList = React.createClass({

    propTypes: {
        list: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        current: React.PropTypes.string.isRequired,
        title: React.PropTypes.string.isRequired,
        open: React.PropTypes.bool.isRequired,
    },

    getInitialProps: function() {
        return {
            list: [],
            current: '',
            title: '',
            open: false
        };
    },

    getInitialState: function() {
        return {
            open: this.props.open
        };
    },

    toggleList: function() {
        this.setState({
            open: !this.state.open
        });
    },

    render: function() {
        var list = [];

        _.each(this.props.list, function(planet) {
            list.push(
                <PlanetListItem
                    key={planet.id}
                    name={planet.name}
                    id={planet.id}
                    x={planet.x}
                    y={planet.y}
                    zone={planet.zone}
                    current={this.props.current}
                />
            );
        }, this);

        return (
            <div>
                <div
                    className="ui horizontal inverted divider"
                    title={
                        this.state.open
                        ? 'Click to hide ' + this.props.title.toLowerCase()
                        : 'Click to show ' + this.props.title.toLowerCase()
                    }
                    onClick={this.toggleList}
                    style={{
                        cursor: 'pointer',
                    }}
                >
                    {this.props.title}
                </div>
                <div style={{
                    display: this.state.open ? '' : 'none'
                }}>
                    {list}
                </div>
            </div>
        );
    }
});

var RightSidebar = React.createClass({
    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire'),
        Reflux.connect(BodyRPCStore, 'body')
    ],

    render: function() {
        var items = [
            ['My Colonies', 'colonies', 1],
            ['My Stations', 'mystations', 0],
            ['Our Stations', 'ourstations', 0]
        ];

        var bodiesList = _.map(items, function(item) {
            var list = this.state.empire.bodies[item[1]] || []

            if (list.length > 0) {
                return (
                    <BodyList
                        title={item[0]}
                        list={list}
                        current={this.state.body.id}
                        open={item[2]}
                    />
                );
            }
        }, this)

        return (
            <div className="ui right vertical inverted sidebar menu">
                {bodiesList}
            </div>
        );
    }
});

module.exports = RightSidebar;
