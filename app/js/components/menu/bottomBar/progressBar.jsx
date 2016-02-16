'use strict';

var React = require('react');

var ProgressBar = React.createClass({

    propTypes : {
        percent : React.PropTypes.number.isRequired
    },

    render : function() {
        return (
            <div style={{
                display         : 'inline-block',
                position        : 'absolute',
                top             : '0',
                left            : '0',
                width           : this.props.percent + '%',
                maxWidth        : '100% !important',
                height          : '2px',
                boxShadow       : '1px 1px 1px rgba(0,0,0,0.4)',
                borderRadius    : '1px 1px 1px 1px',
                backgroundColor : '#4cd964'
            }}/>
        );
    }
});

module.exports = ProgressBar;
