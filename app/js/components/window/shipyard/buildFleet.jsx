'use strict';

var React                           = require('react');
var Reflux                          = require('reflux');
var _                               = require('lodash');
var $                               = require('js/shims/jquery');

var ShipyardRPCActions              = require('js/actions/rpc/shipyard');
var GetBuildableShipyardRPCStore    = require('js/stores/rpc/shipyard/getBuildable');

var FleetItem                       = require('js/components/window/shipyard/buildFleetItem');

var BuildFleet = React.createClass({

    propTypes : {
        building : React.PropTypes.object.isRequired
    },

    mixins : [
        Reflux.connect(GetBuildableShipyardRPCStore, 'getBuildableStore')
    ],

    componentDidMount : function() {
        $(this.refs.dropdown).dropdown();
    },

    render : function() {
        return (
            <div>
              <div>There are xxx docks available for new ships. You can queue yyy ships.</div>
              <div className="ui grid">
                <div className="one wide column">Use</div>
                <div className="five wide column">
                  <select className="ui dropdown">
                    <option value="this">This Only</option>
                    <option value="all">All</option>
                    <option value="higher">Same or Higher Level</option>
                    <option value="same">Same Level</option>
                  </select>
                </div>
                <div className="five wide column">
                  Filter <select className="ui dropdown">
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
                  Show <select className="ui dropdown">
                    <option value="all">All</option>
                    <option value="now">Can build now</option>
                    <option value="later">Can build later</option>
                  </select>
                </div>
              </div>
              <div>
                {
                    _.map(this.state.getBuildableStore.buildable.keys, function(fleetName) {
                        return (
                            <FleetItem
                                key={fleetName}
                            />
                        );
                    })
                }
              </div>
            </div>
        );
    }
});

module.exports = BuildFleet;
