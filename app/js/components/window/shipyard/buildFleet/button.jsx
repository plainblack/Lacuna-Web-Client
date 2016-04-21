'use strict';

var React               = require('react');
var classnames          = require('classnames');

var util                = require('js/util');

var ShipyardRPCActions  = require('js/actions/rpc/shipyard');


var BuildButton = React.createClass({

    propTypes : {
        canBuild:   React.PropTypes.number.isRequired,
        obj:        React.PropTypes.object.isRequired,
        buildingId: React.PropTypes.number.isRequired,
        autoSelect: React.PropTypes.string.isRequired,
        fleetType:  React.PropTypes.string.isRequired
    },

    handleQuantity : function(o) {
        var quantity = this.refs.quantity.value;

        ShipyardRPCActions.requestShipyardRPCBuildFleet({
            building_ids :  [this.props.buildingId],
            type :          this.props.fleetType,
            quantity :      quantity,
            autoselect :    this.props.autoSelect  
        });
    },

    render : function() {
        var title       = util.commify(this.props.attr);
        
        if (! this.props.canBuild) {
            return (<div />);
        }
        return (
            <div className="ui fluid action input">
                <input type="text" placeholder="Qty." ref="quantity" />
                <div className="ui green button" onClick={this.handleQuantity}>
                    Build
                </div>
            </div>
        );
    }
});

module.exports = BuildButton;

