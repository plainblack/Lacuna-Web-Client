'use strict';

var React        = require('react');

var ResourceLine = require('js/components/window/building/resourceLine');

var util         = require('js/util');

var ResourceCost = React.createClass({

    propTypes : {
        icon   : React.PropTypes.string.isRequired,
        number : React.PropTypes.number.isRequired,
        stored : React.PropTypes.number
    },

    render : function() {
        var red = false;

        if (typeof this.props.stored === 'number' && this.props.number > this.props.stored) {
            red = true;
        }

        return (
            <ResourceLine
                icon={this.props.icon}
                content={util.reduceNumber(this.props.number)}
                title={util.commify(this.props.number)}
                red={red}
            />
        );
    }
});

module.exports = ResourceCost;
