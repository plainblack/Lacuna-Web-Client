'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');
var $ = require('js/hacks/jquery');

var classNames = require('classnames');

var EmpireRPCStore = require('js/stores/rpc/empire');
var BodyRPCStore = require('js/stores/rpc/body');

var RightSidebarActions = require('js/actions/menu/rightSidebar');
var MapActions = require('js/actions/menu/map');

var toggle = function(callback) {
    return function() {
        RightSidebarActions.toggle();
        callback();
    };
}

var PlanetListItem = React.createClass({
    getInitialProps: function() {
        return {
            name: '',
            id: '',
            current: '',
        };
    },
    propTypes: {
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired
    },
    handleClick: function() {
        console.log('Changing to planet (#' + this.props.id + ').');
        RightSidebarActions.toggle();
        MapActions.changePlanet(this.props.id);
    },
    render: function() {
        var current_world = this.props.current === this.props.id;
        var classStr = classNames({
            'ui large teal label': current_world,
            'item': !current_world
        });
        var refresh = current_world ? toggle(function() { YAHOO.lacuna.MapPlanet.Refresh() }) :
                this.handleClick;

        return (
                <a className={classStr} onClick={refresh} style={{
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
            list: [],
            current: '',
            title: '',
        };
    },
    propTypes: {
        list: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    },
    render: function() {
        var list = [];
        var bl = this;

        _.each(this.props.list, function(planet) {
            list.push(
                <PlanetListItem key={planet.id}
                    name={planet.name}
                    id={planet.id}
                    current={this.props.current} />
            );
        }, this);

        return <div><div className="ui horizontal inverted divider">{this.props.title}</div>
            <div>{list}</div></div>;
    }
});

var RightSidebar = React.createClass({
    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire'),
        Reflux.connect(BodyRPCStore, 'body')
    ],

    render: function() {
        return (
            <div className="ui right vertical inverted sidebar menu">

                <BodyList title="My Colonies" list={this.state.empire.colonies} current={this.state.body.id} />

                {
                    this.state.empire.stations.length > 0 ?
                        <div>
                            <BodyList title="My Stations" list={this.state.empire.stations} current={this.state.body.id}/>
                        </div>
                    :
                        ''
                }
            </div>
        );
    }
});

module.exports = RightSidebar;
