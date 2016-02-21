'use strict';

var React                = require('react');
var ReactDOM             = require('react-dom');
var ReactDOMServer       = require('react-dom/server');
var Reflux               = require('reflux');
var $                    = require('js/shims/jquery');

var BodyRPCStore         = require('js/stores/rpc/body');
var ServerRPCStore       = require('js/stores/rpc/server');
var EmpireRPCStore       = require('js/stores/rpc/empire');

var centerBar            = require('js/components/mixin/centerBar');

var BottomBarSection     = require('js/components/menu/bottomBar/bottomBarSection');

var BuildingCountToolTip = require('js/components/menu/bottomBar/buildingCountToolTip');
var BuildQueueToolTip    = require('js/components/menu/bottomBar/buildQueueToolTip');
var ResourceToolTip      = require('js/components/menu/bottomBar/resourceToolTip');
var RpcCountToolTip      = require('js/components/menu/bottomBar/rpcCountToolTip');

var util                 = require('js/util');
var rn                   = util.reduceNumber;

var BottomBar = React.createClass({
    mixins : [
        Reflux.connect(BodyRPCStore, 'body'),
        Reflux.connect(ServerRPCStore, 'server'),
        Reflux.connect(EmpireRPCStore, 'empire'),
        centerBar('bottombar')
    ],

    componentWillUnmount : function() {
        // Destroy!
        $('div', this.refs.bottombar).popup('destroy');
    },

    showFoodToolTip : function() {
        $(ReactDOM.findDOMNode(this.refs.foodSection)).popup({
            html : ReactDOMServer.renderToStaticMarkup(
                <ResourceToolTip
                    body={this.state.body}
                    icon="food"
                    type="food"
                    title="Food"
                />
            )
        });
    },

    showOreToolTip : function() {
        $(ReactDOM.findDOMNode(this.refs.oreSection)).popup({
            html : ReactDOMServer.renderToStaticMarkup(
                <ResourceToolTip
                    body={this.state.body}
                    icon="diamond"
                    type="ore"
                    title="Ore"
                />
            )
        });
    },

    showWaterToolTip : function() {
        $(ReactDOM.findDOMNode(this.refs.waterSection)).popup({
            html : ReactDOMServer.renderToStaticMarkup(
                <ResourceToolTip
                    body={this.state.body}
                    icon="theme"
                    type="water"
                    title="Water"
                />
            )
        });
    },

    showEnergyToolTip : function() {
        $(ReactDOM.findDOMNode(this.refs.energySection)).popup({
            html : ReactDOMServer.renderToStaticMarkup(
                <ResourceToolTip
                    body={this.state.body}
                    icon="lightning"
                    type="energy"
                    title="Energy"
                />
            )
        });
    },

    showWasteToolTip : function() {
        $(ReactDOM.findDOMNode(this.refs.wasteSection)).popup({
            html : ReactDOMServer.renderToStaticMarkup(
                <ResourceToolTip
                    body={this.state.body}
                    icon="trash"
                    type="waste"
                    title="Waste"
                />
            )
        });
    },

    showHappinessToolTip : function() {
        $(ReactDOM.findDOMNode(this.refs.happinessSection)).popup({
            html : ReactDOMServer.renderToStaticMarkup(
                <ResourceToolTip
                    body={this.state.body}
                    icon="smile"
                    type="happiness"
                    title="Happiness"
                >
                    <div>
                        <i className="large spy icon"></i>
                        {this.state.body.propaganda_boost}
                    </div>
                </ResourceToolTip>
            )
        });
    },

    showBuildingCountToolTip : function() {
        $(ReactDOM.findDOMNode(this.refs.buildingCountSection)).popup({
            html      : ReactDOMServer.renderToStaticMarkup(<BuildingCountToolTip />),
            hoverable : true,
            delay     : {
                hide : 800
            }
        });
    },

    showBuildQueueToolTip : function() {
        var body = this.state.body;

        $(ReactDOM.findDOMNode(this.refs.buildQueueSection)).popup({
            html      : ReactDOMServer.renderToStaticMarkup(<BuildQueueToolTip body={body} />),
            hoverable : true,
            delay     : {
                hide : 800
            }
        });
    },

    showRpcCountToolTip : function() {
        $(ReactDOM.findDOMNode(this.refs.rpcCountSection)).popup({
            html      : ReactDOMServer.renderToStaticMarkup(<RpcCountToolTip />),
            hoverable : true,
            delay     : {
                hide : 800
            }
        });
    },

    render : function() {
        var body   = this.state.body;
        var empire = this.state.empire;
        var server = this.state.server;

        return (
            <div
                className="ui blue inverted compact labeled icon menu small"
                ref="bottombar"
                style={{
                    bottom   : 40,
                    zIndex   : 2000,
                    position : 'fixed',
                    margin   : 0
                }}
            >

                <BottomBarSection
                    ref="foodSection"
                    progressPercent={body.food_percent_full}
                    iconName="food"
                    topText={rn(body.food_stored) + ' / ' + rn(body.food_capacity)}
                    bottomText={rn(body.food_hour) + ' / hr'}
                    toolTipShow={this.showFoodToolTip}
                />

                <BottomBarSection
                    ref="oreSection"
                    progressPercent={body.ore_percent_full}
                    iconName="diamond"
                    topText={rn(body.ore_stored) + ' / ' + rn(body.ore_capacity)}
                    bottomText={rn(body.ore_hour) + ' / hr'}
                    toolTipShow={this.showOreToolTip}
                />

                <BottomBarSection
                    ref="waterSection"
                    progressPercent={body.water_percent_full}
                    iconName="theme"
                    topText={rn(body.water_stored) + ' / ' + rn(body.water_capacity)}
                    bottomText={rn(body.water_hour) + ' / hr'}
                    toolTipShow={this.showWaterToolTip}
                />

                <BottomBarSection
                    ref="energySection"
                    progressPercent={body.energy_percent_full}
                    iconName="lightning"
                    topText={rn(body.energy_stored) + ' / ' + rn(body.energy_capacity)}
                    bottomText={rn(body.energy_hour) + ' / hr'}
                    toolTipShow={this.showEnergyToolTip}
                />

                {
                    this.state.body.type !== 'space station'
                    ? (
                        <BottomBarSection
                            ref="wasteSection"
                            progressPercent={body.waste_percent_full}
                            iconName="trash"
                            topText={rn(body.waste_stored) + ' / ' + rn(body.waste_capacity)}
                            bottomText={rn(body.waste_hour) + ' / hr'}
                            toolTipShow={this.showWasteToolTip}
                        />
                    )
                    : ''
                }

                {
                    this.state.body.type !== 'space station'
                    ? (
                        <BottomBarSection
                            ref="happinessSection"
                            iconName="smile"
                            topText={rn(body.happiness)}
                            bottomText={rn(body.happiness_hour) + ' / hr'}
                            toolTipShow={this.showHappinessToolTip}
                        />
                    )
                    : ''
                }

                <BottomBarSection
                    ref="buildingCountSection"
                    iconName="block layout"
                    topText={
                        body.building_count + ' / ' + (body.building_count + body.plots_available)
                    }
                    bottomText={body.plots_available + ' Available'}
                    toolTipShow={this.showBuildingCountToolTip}
                />

                <BottomBarSection
                    ref="buildQueueSection"
                    iconName="list"
                    topText={
                        body.build_queue_len + (
                            body.type !== 'space station'
                                ? ' / ' + body.build_queue_size
                                : ''
                        )
                    }
                    bottomText="Build Q"
                    toolTipShow={this.showBuildQueueToolTip}
                />

                <BottomBarSection
                    ref="rpcCountSection"
                    iconName="exchange"
                    topText={empire.rpc_count + ' / ' + rn(server.rpc_limit)}
                    bottomText="Actions"
                    toolTipShow={this.showRpcCountToolTip}
                />
            </div>
        );
    }
});

module.exports = BottomBar;
