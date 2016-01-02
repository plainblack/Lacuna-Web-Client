'use strict'

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');
var $ = require('js/shims/jquery');

var Draggable = require('react-draggable');

var MapActions = require('js/actions/menu/map');

var BodyRPCStore = require('js/stores/rpc/body');
var BuildingsRPCStore = require('js/stores/rpc/body/buildings');
var MapModeStore = require('js/stores/menu/mapMode');
var PlanetZoomStore = require('js/stores/menu/planetZoom');
var SurfaceImageStore = require('js/stores/menu/surfaceImage');

var util = require('js/util');

var Lacuna = YAHOO.lacuna;
var Game = Lacuna.Game;

var X_RANGE = BuildingsRPCStore.X_RANGE;
var Y_RANGE = BuildingsRPCStore.Y_RANGE;

// These variables are used by any code that needs to know where the planet map is.
// This is pretty bad practice, so, please avoid it if possible.
var PLANET_MAP_LEFT = 0;
var PLANET_MAP_TOP = 0;


var ConstructionTimer = React.createClass({

    propTypes: {
        building: React.PropTypes.object.isRequired,
        fontSize: React.PropTypes.string.isRequired
    },

    getDefaultProps: function() {
        return {
            building: {},
            fontSize: ''
        };
    },

    render: function() {
        return (
            <div style={{
                right: 0,
                position: 'absolute',
                fontSize: this.props.fontSize
            }}>
                {this.props.building.pending_build.remaining}
            </div>
        );
    }
});

var WorkTimer = React.createClass({

    propTypes: {
        building: React.PropTypes.object.isRequired,
        fontSize: React.PropTypes.string.isRequired
    },

    getDefaultProps: function() {
        return {
            building: {},
            fontSize: ''
        };
    },

    render: function() {
        return (
            <div style={{
                bottom: 0,
                position: 'absolute',
                fontSize: this.props.fontSize,
                color: 'orange'
            }}>
                {this.props.building.work.remaining}
            </div>
        );
    }
});

var EfficiencyIndicator = React.createClass({

    propTypes: {
        building: React.PropTypes.object.isRequired
    },

    getDefaultProps: function() {
        return {
            building: {}
        };
    },

    render: function() {
        var b = this.props.building;
        var style = {};

        if (b.efficiency !== 100 && !b.empty) {
            style = {
                height: '100%',
                width: '100%',
                backgroundColor: 'red',
                opacity: 0.4,
                position: 'absolute'
            };
        }

        return <div style={style}></div>;
    }
});

var LevelIndicator = React.createClass({

    propTypes: {
        building: React.PropTypes.object.isRequired,
        hover: React.PropTypes.bool.isRequired,
        fontSize: React.PropTypes.string.isRequired
    },

    getDefaultProps: function() {
        return {
            building: {},
            hover: false,
            fontSize: ''
        };
    },

    render: function() {
        var b = this.props.building;
        var content = '';

        if (this.props.hover) {
            if (b.empty) {
                content = <i className="configure large icon"></i>;
            } else if (b.efficiency !== 100) {
                content = b.efficiency + '%';
            } else {
                content = b.level;
            }
        }

        return (
            <div style={{
                fontSize: this.props.fontSize,
                cursor: 'pointer',

                /* Horizontal and vertical centering. */
                textAlign: 'center',
                position: 'relative',
                top: '50%',
                WebkitTransform: 'translateY(-50%)',
                MsTransform: 'translateY(-50%)',
                transform: 'translateY(-50%)'
            }}>
                <h1 style={{fontSize: this.props.fontSize}}>
                    {content}
                </h1>
            </div>
        );
    }
});

var BuildingTile = React.createClass({

    mixins: [
        Reflux.connect(PlanetZoomStore, 'zoom')
    ],

    propTypes: {
        building: React.PropTypes.object.isRequired
    },

    getDefaultProps: function() {
        return {
            building: {}
        };
    },

    getInitialState: function() {
        return {
            hover: false
        };
    },

    onMouseEnter: function() {
        this.setState({
            hover: true
        });
    },

    onMouseLeave: function() {
        this.setState({
            hover: false
        });
    },

    // NOTE: previously, using onClick would mean that whenever the user moved the planet map,
    // the callback would be called as if they just clicked on a building. This code reduces
    // the chance of that happening by detecting if the planet view moved in between the
    // mousedown and mouseup events.

    planetMapLeft: 0,
    planetMapTop: 0,

    onMouseDown: function() {
        this.planetMapLeft = PLANET_MAP_LEFT;
        this.planetMapTop = PLANET_MAP_TOP;
    },

    onMouseUp: function() {
        if (
            this.planetMapLeft === PLANET_MAP_LEFT &&
            this.planetMapTop === PLANET_MAP_TOP
        ) {
            this.onClick();

            this.planetMapLeft = 0;
            this.planetMapTop = 0;
        } else {
            // The map was moved, so it shouldn't be registered as a click.
        }
    },

    onClick: function() {
        var b = this.props.building;

        if (b.empty) {
            Lacuna.MapPlanet.BuilderView(b);
        } else {
            Lacuna.MapPlanet.DetailsView(b);
        }
    },

    getImageUrl: function() {
        var b = this.props.building;
        var size = this.state.zoom;
        var assetUrl = YAHOO.lacuna.Library.AssetUrl;

        if (!b.empty) {
            return assetUrl + 'planet_side/' + size + '/' + b.image + '.png';
        } else {
            return '';
        }
    },

    getFontSize: function() {
        var size = util.int(this.state.zoom);

        if (size === 50) {
            return '0.8em';
        } else if (size === 100) {
            return '1.4em';
        } else if (size === 300) {
            return '3em';
        } else if (size === 400) {
            return '4em';
        } else {
            return '1em';
        }
    },

    render: function() {
        var b = this.props.building;
        var size = this.state.zoom;

        var imageUrl = this.getImageUrl();
        var ftz = this.getFontSize();

        return (
            <div
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}

                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}

                className="planetSurfaceCursor"

                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    left: (b.x + 5) * size,
                    top: (b.y - 5) * -size,

                    backgroundImage: b.empty
                        ? ''
                        : 'url(' + imageUrl + ')',

                    margin: this.state.hover
                        ? -1
                        : 0,
                    border: this.state.hover
                        ? '1px dashed #ffffff'
                        : 'none'
                }}
            >

                {
                    b.pending_build ? <ConstructionTimer fontSize={ftz} building={b} /> : ''
                }

                <EfficiencyIndicator building={b} />
                <LevelIndicator hover={this.state.hover} fontSize={ftz}  building={b} />

                {
                    b.work ? <WorkTimer fontSize={ftz} building={b} /> : ''
                }
            </div>
        );
    }
});

var BuildingTiles = React.createClass({

    mixins: [
        Reflux.connect(BuildingsRPCStore, 'buildings')
    ],

    getTiles: function() {
        // This is the list of tiles to return.
        var result = [];

        // Use this to keep track of the tiles that have buildings on them.
        var buildings = {};

        _.each(this.state.buildings, function(b) {
            var key = b.x + '_' + b.y;

            buildings[key] = true;
            result.push(
                <BuildingTile
                    key={key}
                    building={b}
                />
            );
        });

        _.each(X_RANGE, function(x) {
            _.each(Y_RANGE, function(y) {
                var key = x + '_' + y;

                if (!buildings[key]) {
                    result.push(
                        <BuildingTile
                            key={key}
                            building={{
                                x: x,
                                y: y,
                                empty: true
                            }}
                        />
                    );
                }
            });
        });

        return result;
    },

    render: function() {
        return (
            <div style={{
                width: 100 * 11,
                height: 100 * 11
            }}>
                {this.getTiles()}
            </div>
        );
    }
});

var ZoomButtons = React.createClass({
    render: function() {
        return (
            <div style={{
                position: 'absolute',
                top: 100,
                left: 15,
                zIndex: 2500
            }}>
                <div className="blue ui vertical icon buttons" style={{width: 20}}>
                    <div className="ui button" onClick={MapActions.zoomPlanetIn}>
                        <i className="plus icon"></i>
                    </div>
                    <div className="ui button" onClick={MapActions.zoomPlanetOut}>
                        <i className="minus icon"></i>
                    </div>
                </div>
            </div>
        );
    }
});

var DraggableSurface = React.createClass({

    mixins: [
        Reflux.connect(PlanetZoomStore, 'zoom')
    ],

    propTypes: {
        setBackgroundPosition: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
        return {
            setBackgroundPosition: _.noop
        };
    },

    componentDidUpdate: function() {
        var size = this.getSize();
        this.calculateElementPosition(size);
        this.updateElementPosition();

        this.startListeningForScrolling();
    },

    backgroundLeft: 0,
    backgroundTop: 0,

    elementLeft: 0,
    elementTop: 0,

    scrollDistance: 0,

    calculateBackgroundPosition: function(left, top) {
        this.elementLeft = left;
        this.elementTop = top;
    },

    updateBackgroundPosition: function() {
        this.props.setBackgroundPosition(this.elementLeft, this.elementTop + this.scrollDistance);
    },

    calculateElementPosition: function(size) {
        this.elementTop = (window.innerHeight - size) / 2;
        this.elementLeft = (window.innerWidth - size) / 2;
    },

    updateElementPosition: function() {
        var el = this.refs.theThing.getDOMNode();

        el.style.left = this.elementLeft + 'px';
        el.style.top = (this.elementTop + this.scrollDistance) + 'px';
    },

    onDrag: function(event, ui) {
        this.calculateBackgroundPosition(ui.position.left, ui.position.top);
        this.updateBackgroundPosition();
    },

    onScroll: function(event) {
        this.scrollDistance += event.deltaY * event.deltaFactor;

        this.updateBackgroundPosition();
        this.updateElementPosition();
    },

    startListeningForScrolling: _.once(function() {
        $('#planetMapContainer').off().mousewheel(_.bind(this.onScroll, this));
    }),

    getSize: function() {
        return this.state.zoom * 11;
    },

    render: function() {
        var size = this.getSize();
        this.calculateElementPosition(size);

        return (
            <Draggable
                onDrag={this.onDrag}
            >
                <div ref="theThing" style={{position: 'absolute'}}>
                    <BuildingTiles />
                </div>
            </Draggable>
        );
    }
});

var BackgroundImage = React.createClass({

    mixins: [
        Reflux.connect(SurfaceImageStore, 'surfaceImage')
    ],

    setBackgroundPosition: function(left, top) {
        PLANET_MAP_LEFT = left;
        PLANET_MAP_TOP = top;

        document.getElementById('planetMapContainer')
            .style.backgroundPosition = left + 'px ' + top + 'px';
    },

    render: function() {
        return (
            <div id="planetMapContainer" style={{
                backgroundImage: 'url(' + this.state.surfaceImage + ')',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
            }}>
                <ZoomButtons />
                <DraggableSurface
                    setBackgroundPosition={this.setBackgroundPosition}
                />
            </div>
        );
    }
});

var PlanetMap = React.createClass({

    mixins: [
        Reflux.connect(MapModeStore, 'mapMode')
    ],

    render: function() {
        if (this.state.mapMode === MapModeStore.PLANET_MAP_MODE) {
            return (
                <BackgroundImage />
            );
        } else {
            return <div></div>;
        }
    }
});

module.exports = PlanetMap;
