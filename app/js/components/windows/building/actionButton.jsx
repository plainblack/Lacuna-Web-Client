'use strict';

var React = require('react');
var classnames = require('classnames');

var ActionButton = React.createClass({

    propTypes : {
        actionName : React.PropTypes.string.isRequired,
        color      : React.PropTypes.string.isRequired,
        error      : React.PropTypes.string,
        onClick    : React.PropTypes.func.isRequired
    },

    handleClick : function() {
        if (!this.props.error) {
            this.props.onClick();
        }
    },

    render : function() {
        var hasError = !!this.props.error;

        var elementAttributes = {
            className : classnames(
                'ui button',
                {
                    disabled : hasError
                },
                this.props.color
            ),
            onClick : this.handleClick
        };

        if (hasError) {
            elementAttributes['data-tip']   = this.props.error;
            elementAttributes['data-place'] = 'top';
            elementAttributes['data-type']  = 'error';
        }

        return (
            React.createElement('div', elementAttributes, (
                <span>{this.props.actionName}</span>
            ))
        );
    }
});

module.exports = ActionButton;
