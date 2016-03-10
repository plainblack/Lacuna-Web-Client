'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');
var classnames              = require('classnames');

var EssentiaWindowActions   = require('js/actions/windows/essentia');

var BoostsEmpireRPCStore    = require('js/stores/rpc/empire/boosts');
var EmpireRPCStore          = require('js/stores/rpc/empire');

var BoostCountdown          = require('js/components/windows/essentia/boostCountdown');

var Boost = React.createClass({
    mixins : [
        Reflux.connect(BoostsEmpireRPCStore, 'boosts'),
        Reflux.connect(EmpireRPCStore, 'empire')
    ],

    propTypes : {
        type        : React.PropTypes.string.isRequired,
        iconName    : React.PropTypes.string.isRequired,
        description : React.PropTypes.string.isRequired
    },

    getDefaultProps : function() {
        return {
            type        : '',
            iconName    : '',
            description : ''
        };
    },

    handleBoost : function() {
        EssentiaWindowActions.boost(this.props.type, this.refs.weeks.value);
    },

    renderButton : function() {
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

    render : function() {
        return (
            <div style={{
                marginTop : 5
            }}>
                <div className="ui action input">
                    <input
                        type="text"
                        defaultValue="1"
                        ref="weeks"
                        title="Weeks to boost for"
                        disabled={this.state.empire.essentia < 35}
                        style={{
                            width : 45
                        }}
                    />

                    {
                        this.renderButton()
                    }
                </div>
                <BoostCountdown boost={this.state.boosts[this.props.type]} />
            </div>
        );
    }
});

module.exports = Boost;
