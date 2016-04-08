'use strict';

var React                           = require('react');
var Reflux                          = require('reflux');
var _                               = require('lodash');

var ShipyardRPCActions              = require('js/actions/rpc/shipyard');
var GetBuildableShipyardRPCStore    = require('js/stores/rpc/shipyard/getBuildable');

var BuildFleetItem                  = require('js/components/window/shipyard/buildFleetItem');

var BuildFleet = React.createClass({

    propTypes : {
        buildingId :  React.PropTypes.number.isRequired
    },

    getInitialState : function() {
        return {
            show:       'now',
            filter:     'all',
            autoSelect: 'this'
        };
    },

    mixins : [
        Reflux.connect(GetBuildableShipyardRPCStore, 'getBuildableStore')
    ],

    handleShowChange : function(e) {
        this.setState( { show: e.target.value } );
    },

    handleFilterChange : function(e) {
        this.setState( { filter: e.target.value } );
    },

    handleAutoSelectChange : function(e) {
        this.setState( { autoSelect: e.target.value } );
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
        
        // Filter based on ship type
        if (this.state.filter != "all") {
            var filter = this.state.filter;
            fleetTypes = _.filter(fleetTypes, function(fleetType) {
                return _.find(buildable[fleetType].tags, function(o) {
                    return (o == filter);
                });
            });
        }


        fleetTypes.sort();
        var fleetTypesLen = fleetTypes.length;
        
        for (var i = 0; i < fleetTypesLen; i++) {
            fleetItems.push(
                <BuildFleetItem 
                  fleetType =   {fleetTypes[i]} 
                  obj =         {buildable[fleetTypes[i]] } 
                  buildingId =  {this.props.buildingId}
                  autoSelect =  {this.state.autoSelect}
                />
            );
        }

        return (
            <div>
              <div>There are {this.state.getBuildableStore.docks_available} docks available for new ships. You can queue {buildQueueAvailable} ships.</div>
              <div className="ui grid">
                <div className="six wide column">
                  Use <select className="ui dropdown" ref="autoSelect" onChange={this.handleAutoSelectChange}>
                    <option value="this">This Only</option>
                    <option value="all" selected>All</option>
                    <option value="equal_or_higher">Same or Higher Level</option>
                    <option value="equal">Same Level</option>
                  </select>
                </div>
                <div className="five wide column">
                  Filter <select className="ui dropdown" ref="filter" onChange={this.handleFilterChange}>
                    <option value="all" selected>All</option>
                    <option value="Trade">Trade</option>
                    <option value="Mining">Mining</option>
                    <option value="Intelligence">Intelligence</option>
                    <option value="SupplyChain">Supply Chain</option>
                    <option value="WasteChain">Waste Chain</option>
                    <option value="War">War</option>
                    <option value="Colonization">Colonization</option>
                    <option value="Exploration">Exploration</option>
                  </select>
                </div>
                <div className="five wide column">
                  Show <select className="ui dropdown" ref="show" onChange={this.handleShowChange}>
                    <option value="all">All</option>
                    <option value="now" selected>Can build now</option>
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
