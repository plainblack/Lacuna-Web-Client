'use strict';

var React = require('react');
var classnames = require('classnames');

var Progress = require('react-progress');

var BottomBarSection = React.createClass({
    propTypes : {
        iconName        : React.PropTypes.string.isRequired,
        topText         : React.PropTypes.string.isRequired,
        bottomText      : React.PropTypes.string.isRequired,
        toolTipShow     : React.PropTypes.func,
        progressPercent : React.PropTypes.number
    },

    handleToolTip : function() {
        if (typeof this.props.toolTipShow === 'function') {
            this.props.toolTipShow();
        }
    },

    render : function() {
        return (
            <div className="item" onMouseEnter={this.handleToolTip}>
                {
                    this.props.progressPercent
                    ? (
                        <Progress
                            percent={this.props.progressPercent}
                            style={{
                                position : 'absolute'
                            }}
                        />
                    )
                    : ''
                }

                <i className={classnames(this.props.iconName, 'large icon')}></i>

                <p style={{
                    margin    : 0,
                    marginTop : 5
                }}>
                    {this.props.topText}
                </p>

                {this.props.bottomText}
            </div>
        );
    }
});

module.exports = BottomBarSection;
