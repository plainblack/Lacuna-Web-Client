'use strict';

var React               = require('react');
var Reflux              = require('reflux');
var _                   = require('lodash');
var $                   = require('js/shims/jquery');

var classNames          = require('classnames');

var EmpireRPCStore      = require('js/stores/rpc/empire');
var BodyRPCStore        = require('js/stores/rpc/body');

var RightSidebarActions = require('js/actions/menu/rightSidebar');
var MapActions          = require('js/actions/menu/map');

var RightSidebarStore   = require('js/stores/menu/rightSidebar');

var PlanetListItem = React.createClass({

    propTypes : {
        name        : React.PropTypes.string.isRequired,
        id          : React.PropTypes.number.isRequired,
        currentBody : React.PropTypes.number.isRequired,
        zone        : React.PropTypes.string.isRequired
    },

    getInitialProps : function() {
        return {
            name        : '',
            id          : 0,
            currentBody : 0,
            zone        : ''
        };
    },

    // Returns true if this list item is the the currently selected planet.
    isCurrentWorld : function() {
        return this.props.currentBody === this.props.id;
    },

    handleClick : function() {
        RightSidebarActions.hide();

        if (this.isCurrentWorld()) {
            YAHOO.lacuna.MapPlanet.Refresh();
        } else {
            MapActions.changePlanet(this.props.id);
        }
    },

    render : function() {
        var classStr = classNames({
            'ui large teal label' : this.isCurrentWorld(),
            'item'                : !this.isCurrentWorld()
        });

        return (
            <a className={classStr} onClick={this.handleClick} style={{
                // For some reason this doesn't get set on the items (by Semantic) when it should.
                cursor : 'pointer'
            }}>
                {this.props.name} ({this.props.zone})
            </a>
        );
    }
});

var AccordionItem = React.createClass({

    propTypes : {
        list          : React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        currentBody   : React.PropTypes.number.isRequired,
        title         : React.PropTypes.string.isRequired,
        initiallyOpen : React.PropTypes.bool.isRequired
    },

    getInitialProps : function() {
        return {
            list          : [],
            currentBody   : 0,
            title         : '',
            initiallyOpen : false
        };
    },

    getInitialState : function() {
        return {
            open : this.props.initiallyOpen
        };
    },

    componentDidMount : function() {
        RightSidebarActions.collapseAccordion.listen(this.hideList);
        RightSidebarActions.expandAccordion.listen(this.showList);
    },

    showList : function() {
        this.setState({
            open : true
        });
    },

    hideList : function() {
        this.setState({
            open : false
        });
    },

    toggleList : function() {
        this.setState({
            open : !this.state.open
        });
    },

    render : function() {
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
                        cursor : 'pointer'
                    }}
                >
                    {
                        this.state.open
                            ? <i className="angle down icon"></i>
                            : <i className="angle right icon"></i>
                    } {this.props.title}
                </div>
                <div style={{
                    display : this.state.open ? '' : 'none'
                }}>
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
    propTypes : {
        bodies      : React.PropTypes.object.isRequired,
        currentBody : React.PropTypes.number.isRequired
    },

    render : function() {
        var items = [
            {
                title         : 'My Colonies',
                key           : 'colonies',
                initiallyOpen : true,
                isBaby        : false
            },
            {
                title         : 'My Stations',
                key           : 'mystations',
                initiallyOpen : false,
                isBaby        : false
            },
            {
                title         : 'Our Stations',
                key           : 'ourstations',
                initiallyOpen : false,
                isBaby        : false
            }
        ];

        // Handle all the babies.
        _.chain(this.props.bodies.babies || {})
            .keys()
            .sortBy()
            .each(function(babyName) {
                items.push({
                    title         : babyName + "'s Colonies",
                    key           : babyName,
                    initiallyOpen : false,
                    isBaby        : true
                });
            })
            .value();

        return (
            <div>
                {
                    _.map(items, function(item) {
                        var list = [];

                        if (item.isBaby) {
                            list = this.props.bodies.babies[item.key].planets;
                        } else {
                            list = this.props.bodies[item.key] || [];
                        }

                        if (list.length > 0) {
                            return (
                                <AccordionItem
                                    title={item.title}
                                    list={list}
                                    initiallyOpen={item.initiallyOpen}
                                    currentBody={this.props.currentBody}
                                    key={item.title}
                                />
                            );
                        }
                    }, this)
                }
            </div>
        );
    }
});

var RightSidebar = React.createClass({

    mixins : [
        Reflux.connect(EmpireRPCStore, 'empire'),
        Reflux.connect(BodyRPCStore, 'body'),
        Reflux.connect(RightSidebarStore, 'showSidebar')
    ],

    componentDidMount : function() {
        var el = this.refs.sidebar;

        $(el)
            .sidebar({
                context    : $('#sidebarContainer'),
                duration   : 300,
                transition : 'overlay',
                onHidden   : RightSidebarActions.hide,
                onVisible  : RightSidebarActions.show
            });
    },

    componentDidUpdate : function(prevProps, prevState) {
        if (prevState.showSidebar !== this.state.showSidebar) {
            this.handleSidebarShowing();
        }

        var $header = $(this.refs.header);
        var $content = $(this.refs.content);

        $content.css({
            height : window.innerHeight - $header.outerHeight()
        });
    },

    handleSidebarShowing : function() {
        var el = this.refs.sidebar;

        $(el)
            .sidebar(this.state.showSidebar ? 'show' : 'hide');
    },

    homePlanet : function() {
        RightSidebarActions.hide();
        MapActions.changePlanet(this.state.empire.home_planet_id);
    },

    expand : function() {
        RightSidebarActions.expandAccordion();
    },

    collapse : function() {
        RightSidebarActions.collapseAccordion();
    },

    render : function() {
        return (
            <div className="ui right vertical inverted sidebar menu" ref="sidebar">

                <div ref="header" style={{paddingTop : 7}}>
                    <a
                        title="Go to home planet"
                        className="item"
                        onClick={this.homePlanet}
                        style={{
                            display : 'inline'
                        }}
                    >
                        Home
                    </a>

                    <div style={{float : 'right'}}>
                        <a
                            title="Expand all"
                            className="item"
                            onClick={this.expand}
                            style={{
                                display : 'inline'
                            }}
                        >
                            [+]
                        </a>

                        <a
                            title="Collapse all"
                            className="item"
                            onClick={this.collapse}
                            style={{
                                display : 'inline'
                            }}
                        >
                            [-]
                        </a>
                    </div>
                </div>

                <div ref="content" style={{
                    overflow  : 'auto',
                    overflowX : 'hidden'
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
