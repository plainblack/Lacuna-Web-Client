'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var EmpireRPCStore = require('js/stores/rpc/empire');
var BodyRPCStore = require('js/stores/rpc/body');
var MapModeStore = require('js/stores/menu/mapMode');

var centerBar = require('js/components/mixin/centerBar');
var classNames = require('classnames');

var UserActions = require('js/actions/user');
var MapActions = require('js/actions/menu/map');

var MailActions = require('js/actions/window/mail');
var EssentiaActions = require('js/actions/window/essentia');
var StatsActions = require('js/actions/window/stats');

var BodiesDropdown = React.createClass({
    propTypes: {
        name: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.bool
        ]),
        bodies: React.PropTypes.array
    },

    handleClick: function(event) {
        MapActions.changePlanet(event.target.getAttribute('value'))
    },

    handleBodies: function(body) {
        return (
            <a
                className="item"
                key={body.id}
                value={body.id}
                onClick={this.handleClick}
                style={{
                    marginRight: 10,
                    backgroundColor: '#3b83c0',
                    color: '#ffffff !important',
                    fontWeight: body.name === BodyRPCStore.getData().name
                        ? 'bold'
                        : 'normal'
                }}
            >
                {body.name}
            </a>
        );
    },

    render: function() {
        var list = _.map(this.props.bodies, this.handleBodies)

        var listStyle = {
            maxHeight: '300px',
            overflow: 'auto',
            overflowX: 'hidden',
            backgroundColor: '#3b83c0',
            color: '#ffffff !important'
        };

        if (this.props.name) {
            return (
                <div className="item">
                    <span style={{
                        color: '#ffffff !important'
                    }}>
                        {this.props.name}
                    </span> <i className="dropdown icon" style={{
                        opacity: 0.75,
                        color: '#ffffff'
                    }}></i>
                    <div className="menu" style={listStyle}>
                        {list}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="menu" style={listStyle}>
                    {list}
                </div>
            );
        }
    }
})

var ColonyDropdown = React.createClass({
    propTypes: {
        colonies: React.PropTypes.array,
        stations: React.PropTypes.array
    },

    render: function() {
        if (this.props.colonies.length && this.props.stations.length) {
            return (
                <div className="menu" style={{
                    backgroundColor: '#3b83c0'
                }}>
                    <BodiesDropdown
                        name="Colonies"
                        bodies={this.props.colonies}
                    />
                    <BodiesDropdown
                        name="Stations"
                        bodies={this.props.stations}
                    />
                </div>
            );
        } else {
            return (
                <BodiesDropdown
                    name={false}
                    bodies={this.props.colonies}
                />
            );
        }
    },
});

var TopBar = React.createClass({
    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire'),
        Reflux.connect(MapModeStore, 'mapMode'),
        Reflux.connect(BodyRPCStore, 'body'),
        centerBar('bar')
    ],

    mapButtonTip: function() {
        if (this.state.mapMode === MapModeStore.PLANET_MAP_MODE) {
            return 'To Star Map';
        } else {
            return 'To Planet Map';
        }
    },

    render: function() {
        var barClass = classNames('ui inverted menu', {
            red: this.state.empire.self_destruct_active,
            blue: !this.state.empire.self_destruct_active
        });

        return (
            <div className={barClass} ref="bar" style={{
                position: 'fixed',
                margin: 0,
                zIndex: 2000,
                width: 'auto',
                height: 'auto',
                display: 'inline-block',
                top: '15px'
            }}>

                <a className="item" data-tip={this.mapButtonTip()}
                    onClick={MapActions.toggleMapMode}>
                    <i className="map big icon"></i>
                </a>

                <a className="item" data-tip="Mail" onClick={MailActions.show}>
                    <i className="mail big icon"></i>
                    {
                        this.state.empire.has_new_messages > 0
                            ?
                                <div className="ui yellow circular label">
                                    {this.state.empire.has_new_messages}
                                </div>
                            :
                                ''
                    }
                </a>

                <a className="item" data-tip="Essentia" onClick={EssentiaActions.show}>
                    <i className="money big icon"></i>
                    <div className="ui teal floated right circular label">
                        {this.state.empire.essentia}
                    </div>
                </a>

                <a className="item" data-tip="Universe Rankings" onClick={StatsActions.show}>
                    <i className="find big icon"></i>
                </a>

                <div className="ui item simple dropdown" ref="planetDropdown">
                    <div className="ui circular teal label">
                        {this.state.body.name}
                    </div> <i className="dropdown icon"></i>

                    <ColonyDropdown
                        colonies={this.state.empire.colonies}
                        stations={this.state.empire.stations}
                    />
                </div>

                <a className="item" data-tip="Sign Out" onClick={UserActions.signOut}>
                    <i className="power big icon"></i>
                </a>
            </div>
        );
    }
});

module.exports = TopBar;
