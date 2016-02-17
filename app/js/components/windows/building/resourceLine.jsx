'use strict';

var React      = require('react');
var classnames = require('classnames');

var ResourceLine = React.createClass({

    propTypes : {
        icon    : React.PropTypes.string.isRequired,
        title   : React.PropTypes.string.isRequired,
        content : React.PropTypes.string.isRequired
    },

    render : function() {
        return (
            <div style={{
                marginTop : 5
            }}>
                <i className={classnames(this.props.icon, 'large icon')}></i>
                <span
                    style={{
                        float : 'right'
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
