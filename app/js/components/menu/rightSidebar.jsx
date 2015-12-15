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
        currentBody: React.PropTypes.string.isRequired
    },

    getInitialProps: function() {
        return {
            name: '',
            id: '',
            currentBody: '',
        };
    },

    // Returns true if this list item is the the currently selected planet.
    isCurrentWorld: function() {
        return this.props.currentBody === this.props.id
    },

    handleClick: function() {
        RightSidebarActions.toggle();

        if (this.isCurrentWorld()) {
            YAHOO.lacuna.MapPlanet.Refresh()
        } else {
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

var AccordionItem = React.createClass({

    propTypes: {
        list: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        current: React.PropTypes.string.isRequired,
        title: React.PropTypes.string.isRequired,
        open: React.PropTypes.bool.isRequired,
    },

    getInitialProps: function() {
        return {
            list: [],
            currentBody: '',
            title: '',
            open: false
        };
    },

    getInitialState: function() {
        return {
            open: this.props.open
        };
    },

    componentDidMount: function() {
        RightSidebarActions.collapseAccordion.listen(this.hideList);
        RightSidebarActions.expandAccordion.listen(this.showList);
    },

    showList: function() {
        this.setState({
            open: true
        });
    },

    hideList: function() {
        this.setState({
            open: false
        });
    },

    toggleList: function() {
        this.setState({
            open: !this.state.open
        });
    },

    render: function() {
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

                    {
                        _.map(this.props.list, function(planet) {
                            return (
                                <PlanetListItem
                                    key={planet.id}
                                    name={planet.name}
                                    id={planet.id}
                                    x={planet.x}
                                    y={planet.y}
                                    zone={planet.zone}
                                    currentBody={this.props.currentBody}
                                />
                            );
                        }, this)
                    }
                </div>
            </div>
        );
    }
});

var BodiesAccordion = React.createClass({

    items: [
        ['My Colonies', 'colonies'],
        ['My Stations', 'mystations'],
        ['Our Stations', 'ourstations']
    ],

    render: function() {
        return (
            <div>
                {
                    _.map(this.items, function(item) {
                        var list = this.props.bodies[item[1]] || [];

                        if (list.length > 0) {
                            return (
                                <AccordionItem
                                    title={item[0]}
                                    list={list}
                                    currentBody={this.props.currentBody}
                                />
                            );
                        }
                    }, this)
                }
            </div>
        );
    }
})

var RightSidebar = React.createClass({

    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire'),
        Reflux.connect(BodyRPCStore, 'body')
    ],

    componentDidUpdate: function() {
        var $header = $(this.refs.header.getDOMNode());
        var $content = $(this.refs.content.getDOMNode());

        $content.css({
            height: window.innerHeight - $header.height()
        });
    },

    homePlanet: function() {
        RightSidebarActions.toggle();
        MapActions.changePlanet(this.state.empire.home_planet_id);
    },

    expand: function() {
        RightSidebarActions.expandAccordion();
    },

    collapse: function() {
        RightSidebarActions.collapseAccordion();
    },

    render: function() {
        return (
            <div className="ui right vertical inverted sidebar menu">

                <div ref="header">
                    <a className="item" onClick={this.homePlanet}>
                        Go to home planet
                    </a>

                    <a className="item" onClick={this.expand}>
                        Expand all
                    </a>

                    <a className="item" onClick={this.collapse}>
                        Collapse all
                    </a>
                </div>

                <div ref="content" style={{
                    overflow: 'auto',
                    overflowX: 'hidden'
                }}>
                    <BodiesAccordion
                        bodies={this.state.empire.bodies}
                        currentBody={this.state.body.id}
                    />
                </div>
            </div>
        );
    }
});

module.exports = RightSidebar;
