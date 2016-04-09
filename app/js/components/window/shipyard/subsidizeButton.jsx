'use strict';

var React               = require('react');
var classnames          = require('classnames');

var util                = require('js/util');

var ShipyardRPCActions  = require('js/actions/rpc/shipyard');


var SubsidizeButton = React.createClass({

    propTypes : {
        obj:        React.PropTypes.object.isRequired,
        buildingId: React.PropTypes.number.isRequired
    },

    render : function() {
        
        return (
            <div className="ui fluid action input">
                <div className="ui green button" >
                    Subsidize, 23E
                </div>
            </div>
        );
    }
});

module.exports = SubsidizeButton;

