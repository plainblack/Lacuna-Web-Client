'use strict';

var React                       = require('react');
var Reflux                      = require('reflux');
var _                           = require('lodash');

var ShipyardRPCActions          = require('js/actions/rpc/shipyard');
var BuildQueueShipyardRPCStore  = require('js/stores/rpc/shipyard/buildQueue');

var BuildQueueItem              = require('js/components/window/shipyard/buildQueue/item');

var BuildQueueTab = React.createClass({

    propTypes : {
        //buildingId :  React.PropTypes.number.isRequired
    },

    getInitialState : function() {
        return {
        };
    },

    componentWillMount : function() {
        ShipyardRPCActions.requestShipyardRPCViewBuildQueue( { building_id : this.props.buildingId } );
    },

    mixins : [
        Reflux.connect(BuildQueueShipyardRPCStore, 'buildQueueStore')
    ],

    render : function() {
        var fleetsBuilding = this.state.buildQueueStore.fleets_building;

        var buildQueueLen = fleetsBuilding.length;
        var fleetItems = [];
        
        for (var i = 0; i < buildQueueLen; i++) {
            fleetItems.push(
                <BuildQueueItem
                  obj           = {fleetsBuilding[i] }
                  buildingId    = {this.props.buildingId}
                />
            );
        }

        return (
            <div>
              <div>You may subsidize the whole build queue for {this.state.buildQueueStore.cost_to_subsidize} Essentia</div>
              <div className="ui sixteen column grid">
                <div className="row">
                  <div className="column three wide">Ship Type</div>
                  <div className="column four wide">Number of ships</div>
                  <div className="column four wide">Time to complete</div>
                  <div className="column five wide">Subsidize cost</div>
                </div>
              </div>
              <div className="ui divider"></div>
              <div>
                {fleetItems}
              </div>
            </div>
        );
    }
});

module.exports = BuildQueueTab;
