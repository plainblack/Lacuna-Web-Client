'use strict';

var React                           = require('react');
var Reflux                          = require('reflux');
var _                               = require('lodash');

var ShipyardRPCActions              = require('js/actions/rpc/shipyard');
var BuildQueueShipyardRPCStore      = require('js/stores/rpc/shipyard/buildQueue');


var BuildQueue = React.createClass({

    propTypes : {
        buildingId :  React.PropTypes.number.isRequired
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

        return (
            <div>
              <div>You may subsidize the whole build queue for {this.state.buildQueueStore.cost_to_subsidize} Essentia</div>
              <div className="ui four column grid">
                <div className="row">
                  <div className="column">Ship Type</div>
                  <div className="column">Number of ships</div>
                  <div className="column">Time to complete</div>
                  <div className="column">Subsidize cost</div>
                </div>
              </div>
              <div className="ui divider"></div>
              <div>
              </div>
            </div>
        );
    }
});

module.exports = BuildQueue;
