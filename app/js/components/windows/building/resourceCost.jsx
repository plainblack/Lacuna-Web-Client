'use strict';

var React        = require('react');

var ResourceLine = require('js/components/windows/building/resourceLine');

var util         = require('js/util');

var ResourceCost = React.createClass({

    propTypes : {
        icon   : React.PropTypes.string.isRequired,
        number : React.PropTypes.number.isRequired,
        body   : React.PropTypes.object.isRequired
    },

    render : function() {
        return (
            <ResourceLine
                icon={this.props.icon}
                content={util.reduceNumber(this.props.number)}
                title={util.commify(this.props.number)}
            />
        );
    }
});

module.exports = ResourceCost;
