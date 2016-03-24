'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');
var classnames              = require('classnames');
var validator               = require('validator');

var EssentiaWindowActions   = require('js/actions/windows/essentia');
var EmpireRPCActions        = require('js/actions/rpc/empire');


var BoostCountdown          = require('js/components/window/essentia/boostCountdown');

var Boost = React.createClass({

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
        var type = this.props.type;
        var weeks = this.refs.weeks.value;

        if (
            !validator.isInt(weeks, {
                min : 1,
                max : 100 // The server has no max but this seems like a reasonable limit, to me.
            })
        ) {
            window.alert('Number of weeks must be an integer between 1 and 100.');
            return;
        } else if (weeks * 5 > this.props.essentia) {
            window.alert('Insufficient Essentia.');
            return;
        }
        EmpireRPCActions.requestEmpireRPCBoost({ type : type, weeks : weeks });
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
                        disabled={this.props.essentia < 35}
                        style={{
                            width : 45
                        }}
                    />

                    {
                        this.renderButton()
                    }
                </div>
                <BoostCountdown boost={this.props.boosts[this.props.type]} />
            </div>
        );
    }
});

module.exports = Boost;
