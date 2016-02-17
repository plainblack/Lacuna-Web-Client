'use strict';

var React      = require('react');
var classnames = require('classnames');

var ResourceLine = React.createClass({

    propTypes : {
        icon    : React.PropTypes.string.isRequired,
        title   : React.PropTypes.string.isRequired,
        content : React.PropTypes.string.isRequired,
        red     : React.PropTypes.bool
    },

    render : function() {
        var iconClass = classnames(this.props.icon, 'large icon', {red : this.props.red});

        return (
            <div style={{
                marginTop : 5
            }}>
                <i className={iconClass}></i>
                <span
                    style={{
                        float : 'right',
                        color : this.props.red ? 'red' : 'white'
                    }}
                    title={this.props.title}
                >
                    {this.props.content}
                </span>
            </div>
        );
    }
});

module.exports = ResourceLine;
