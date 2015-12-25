'use strict';

var React = require('react');
var Reflux = require('reflux');
var $ = require('js/shims/jquery');
var _ = require('lodash');
var classnames = require('classnames');

var EssentiaActions = require('js/actions/window/essentia');
var InviteActions = require('js/actions/window/invite');

var BoostsRPCStore = require('js/stores/rpc/empire/boosts');
var EmpireRPCStore = require('js/stores/rpc/empire');
var EssentiaRPCStore = require('js/stores/rpc/empire/essentia').listen(_.noop);
var EssentiaWindowStore = require('js/stores/window/essentia');
var SessionStore = require('js/stores/session');

var Panel = require('js/components/panel');

var ReactTabs = require('react-tabs');
var ReactTooltip = require('react-tooltip');
var Tab = ReactTabs.Tab;
var Tabs = ReactTabs.Tabs;
var TabList = ReactTabs.TabList;
var TabPanel = ReactTabs.TabPanel;

var util = require('js/util');

var BoostCountdown = React.createClass({
    propTypes: {
        boost: React.PropTypes.object.isRequired
    },

    getDefaultProps: function() {
        return {
            boost: {
                ms: 0,
                display: ''
            }
        };
    },

    render: function() {
        if (this.props.boost && this.props.boost.ms > 0) {
            var day = 1000 * 60 * 60 * 24; // Milliseconds per day
            var ms = this.props.boost.ms;

            // Change the color of the tags as the countdown gets closer to zero.
            var className = classnames('ui left pointing label', {
                green: ms > (3 * day), // More than three days
                yellow: (3 * day) > ms && ms > day, // Less than three days and more than one day
                red: day > ms // Less than one day
            });

            return (
                <div className={className}>
                    {this.props.boost.display}
                </div>
            );
        } else {
            return <div></div>;
        }
    }
});

var Boost = React.createClass({
    mixins: [
        Reflux.connect(BoostsRPCStore, 'boosts'),
        Reflux.connect(EmpireRPCStore, 'empire')
    ],

    propTypes: {
        type: React.PropTypes.string.isRequired,
        iconName: React.PropTypes.string.isRequired,
        description: React.PropTypes.string.isRequired
    },

    getDefaultProps: function() {
        return {
            type: '',
            iconName: '',
            description: ''
        };
    },

    handleBoost: function() {
        EssentiaActions.boost(this.props.type, this.refs.weeks.getDOMNode().value);
    },

    renderButton: function() {
        var iconClassName = classnames('icon', this.props.iconName);

        return (
            <div
                className="ui orange button"
                onClick={this.handleBoost}
                data-tip={this.props.description}
                data-place="top"
            >
                <i className={iconClassName}></i>
                Boost
            </div>
        );
    },

    render: function() {
        return (
            <div>
                <div className="ui action input">
                    <input
                        type="text"
                        defaultValue="1"
                        ref="weeks"
                        title="Weeks to boost for"
                        disabled={this.state.empire.essentia < 35}
                        style={{
                            width: 30
                        }}
                    ></input>
                    {
                        this.renderButton()
                    }
                </div>
                <BoostCountdown boost={this.state.boosts[this.props.type]} />

            </div>
        );
    }
});

var BoostsPanel = React.createClass({
    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire')
    ],

    render: function() {
        return (
            <div className="ui grid">

                <div className="centered row">
                    <div className="ui large green labels">
                        <div className="ui label">
                            Essentia
                            <div className="detail">
                                {this.state.empire.exactEssentia}
                            </div>
                        </div>
                        <div className="ui label">
                            Boost Cost
                            <div className="detail">
                                5 Essentia
                            </div>
                        </div>
                    </div>
                </div>

                <div className="centered row">
                    <div className="seven wide column">
                        <Boost
                            type="food"
                            description="+25% Food / hr"
                            iconName="food"
                        />
                    </div>
                    <div className="seven wide column">
                        <Boost
                            type="ore"
                            description="+25% Ore / hr"
                            iconName="diamond"
                        />
                    </div>
                </div>

                <div className="centered row">
                    <div className="seven wide column">
                        <Boost
                            type="water"
                            description="+25% Water / hr"
                            iconName="theme"
                        />
                    </div>
                    <div className="seven wide column">
                        <Boost
                            type="energy"
                            description="+25% Energy / hr"
                            iconName="lightning"
                        />
                    </div>
                </div>

                <div className="centered row">
                    <div className="seven wide column">
                        <Boost
                            type="happiness"
                            description="+25% Happiness / hr"
                            iconName="smile"
                        />
                    </div>
                    <div className="seven wide column">
                        <Boost
                            type="storage"
                            description="+25% Storage"
                            iconName="archive"
                        />
                    </div>
                </div>

                <div className="centered row">
                    <div className="seven wide column">
                        <Boost
                            type="building"
                            description="+25% Building Construction Speed"
                            iconName="building outline"
                        />
                    </div>
                    <div className="seven wide column">
                        <Boost
                            type="spy_training"
                            description="+50% Spy Training Speed"
                            iconName="protect"
                        />
                    </div>
                </div>
            </div>
        );
    }
});

var GetEssentiaPanel = React.createClass({

    purchase: function() {
        var url = "/pay?session_id=" + SessionStore.getData();
        window.open(url, "essentiaPayment", "status=0,toolbar=0,location=0,menubar=0,resizable=1,scrollbars=1,height=550,width=600,directories=0");
    },

    redeem: function() {
        EssentiaActions.redeemCode(this.refs.code.getDOMNode().value);
        this.refs.code.getDOMNode().value = '';
    },

    invite: function() {
        EssentiaActions.hide();
        InviteActions.show();
    },

    render: function() {
        return (
            <div style={{textAlign: 'center'}}>
                <div className="ui large green labeled icon button" onClick={this.purchase}>
                    <i className="payment icon"></i>
                    Purchase Essentia
                </div>

                <h3>OR</h3>

                <div className="ui large fluid action input">
                    <input type="text" placeholder="Essentia code" ref="code">
                        <button className="ui blue button" onClick={this.redeem}>Redeem</button>
                    </input>
                </div>

                <h3>OR</h3>

                <p>
                    Invite your friends to the game and you get <strong>free Essentia!</strong> For
                    every university level past 4 that they achieve, you'll get 5 Essentia.
                    That's up to <u><strong>130 Essentia</strong></u> per friend!
                </p>

                <div className="ui large green labeled icon button" onClick={this.invite}>
                    <i className="add user icon"></i>
                    Invite a Friend
                </div>
            </div>
        );
    }
});

var EssentiaWindow = React.createClass({
    mixins: [
        Reflux.connect(EssentiaWindowStore, 'show')
    ],

    getInitialState: function() {
        return {
            selectedIndex: 0
        };
    },

    handleSelect: function(index) {
        this.setState({
            selectedIndex: index
        });
    },

    render: function() {
        return (
            <Panel
                title="Essentia"
                onClose={EssentiaActions.hide}
                show={this.state.show}
                width={600}
            >

                <Tabs
                    selectedIndex={this.state.selectedIndex}
                    onSelect={this.handleSelect}
                >
                    <TabList>
                        <Tab>Boosts</Tab>
                        <Tab>Get More Essentia</Tab>
                    </TabList>

                    <TabPanel>
                        <BoostsPanel />
                    </TabPanel>

                    <TabPanel>
                        <GetEssentiaPanel />
                    </TabPanel>
                </Tabs>
            </Panel>
        );
    }
});

module.exports = EssentiaWindow;
