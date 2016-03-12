'use strict';

var React = require('react');

var RPCCountToolTip = React.createClass({

    propTypes : {
        body : React.PropTypes.object.isRequired
    },

    render : function() {
        if (this.props.body.type === 'space station') {
            return (
                <div>
                    How many modules are queued to be built. Space stations do not have a build queue limit.
                </div>
            );
        } else {
            return (
                <div>
                    How many <a target="_new" href="http://community.lacunaexpanse.com/wiki/development-ministry">buildings are or can be queued.</a>.
                </div>
            );
        }
    }
});

module.exports = RPCCountToolTip;
