'use strict';

var React                           = require('react');
var Reflux                          = require('reflux');

var BuildFleetItem = React.createClass({

    propTypes : {
        key : React.PropTypes.string.isRequired,
        obj : React.PropTypes.object.isRequired
    },

    render : function() {
        return (
            <div>{this.props.key}</div>
        );
    }
});

module.exports = BuildFleetItem;
