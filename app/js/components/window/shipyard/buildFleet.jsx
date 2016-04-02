'use strict';

var React                           = require('react');
var Reflux                          = require('reflux');
var _                               = require('lodash');
var $                               = require('js/shims/jquery');

var ShipyardRPCActions              = require('js/actions/rpc/shipyard');
var GetBuildableShipyardRPCStore    = require('js/stores/rpc/shipyard/getBuildable');

var BuildFleetItem                  = require('js/components/window/shipyard/buildFleetItem');

var BuildFleet = React.createClass({

    propTypes : {
    },

    mixins : [
        Reflux.connect(GetBuildableShipyardRPCStore, 'getBuildableStore')
    ],

    componentDidMount : function() {
        $(this.refs.dropdown).dropdown();
    },

    handleShowChange : function(e) {
        this.setState( { show: e.target.value } );
    },

    render : function() {
        var buildQueueAvailable = this.state.getBuildableStore.build_queue_max - this.state.getBuildableStore.build_queue_used;
        var fleetItems = [];
        var buildable = this.state.getBuildableStore.buildable;
        var fleetTypes = Object.keys(buildable);

        // Filter based on buildable now or later.
        if (this.state.show == "now") {
            fleetTypes = _.filter(fleetTypes, function(fleetType) {
                return buildable[fleetType].can;
            });
        }
        else if (this.state.show == "later") {
            fleetTypes = _.filter(fleetTypes, function(fleetType) {
                return !buildable[fleetType].can;
            });
        }

        fleetTypes.sort();
        var fleetTypesLen = fleetTypes.length;
        
        for (var i = 0; i < fleetTypesLen; i++) {
            fleetItems.push(
                <BuildFleetItem fleetType={fleetTypes[i]} obj={buildable[fleetTypes[i]] } />
            );
        }

        return (
            <div>
              <div>There are {this.state.getBuildableStore.docks_available} docks available for new ships. You can queue {buildQueueAvailable} ships.</div>
              <div className="ui grid">
                <div className="six wide column">
                  Use <select className="ui dropdown" ref="useShipyard">
                    <option value="this">This Only</option>
                    <option value="all">All</option>
                    <option value="higher">Same or Higher Level</option>
                    <option value="same">Same Level</option>
                  </select>
                </div>
                <div className="five wide column">
                  Filter <select className="ui dropdown" ref="filter">
                    <option value="all">All</option>
                    <option value="trade">Trade</option>
                    <option value="mining">Mining</option>
                    <option value="intelligence">Intelligence</option>
                    <option value="supplychain">Supply Chain</option>
                    <option value="wastechain">Waste Chain</option>
                    <option value="war">War</option>
                    <option value="colonization">Colonization</option>
                    <option value="exploration">Exploration</option>
                  </select>
                </div>
                <div className="five wide column">
                  Show <select className="ui dropdown" ref="show" onChange={this.handleShowChange}>
                    <option value="all">All</option>
                    <option value="now">Can build now</option>
                    <option value="later">Can build later</option>
                  </select>
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

module.exports = BuildFleet;
