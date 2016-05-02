'use strict';

var React                           = require('react');
var Reflux                          = require('reflux');
var _                               = require('lodash');
var constants                       = require('js/constants');

var SpacePortRPCActions             = require('js/actions/rpc/spacePort');

var OwnFleetsTab = React.createClass({

    propTypes : {
        //buildingId :  React.PropTypes.number.isRequired
    },

    getInitialState : function() {
        return {
            task :      'all',
            tag :       'all',
            type :      'all',
            name :      ''
        };
    },

    mixins : [
    ],

    handleTaskChange : function(e) {
        this.setState( { task : e.target.value } );
    },

    handleTagChange : function(e) {
        this.setState( { tag: e.target.value } );
    },

    render : function() {
        var fleetTypes = constants.FLEET_TYPES;
        var renderFleetTypes = [];
        for (var prop in fleetTypes) {
           if (fleetTypes.hasOwnProperty(prop)) {
                renderFleetTypes.push( <option value="{prop}">{fleetTypes[prop]}</option> );
            }
        }
        var fleetTags = constants.FLEET_TAGS;
        var renderFleetTags = [];
        for (var prop in fleetTags) {
           if (fleetTags.hasOwnProperty(prop)) {
                renderFleetTags.push( <option value="{prop}">{fleetTags[prop]}</option> );
            }
        }
        var fleetTasks = constants.FLEET_TASKS;
        var renderFleetTasks = [];
        for (var prop in fleetTasks) {
           if (fleetTasks.hasOwnProperty(prop)) {
                renderFleetTasks.push( <option value="{prop}">{fleetTasks[prop]}</option> );
            }
        }


//        var buildQueueAvailable = this.state.getBuildableStore.build_queue_max - this.state.getBuildableStore.build_queue_used;
//        var fleetItems = [];
//        var buildable = this.state.getBuildableStore.buildable;
//        var fleetTypes = Object.keys(buildable);
//
//        // Filter based on buildable now or later.
//        if (this.state.show == "now") {
//            fleetTypes = _.filter(fleetTypes, function(fleetType) {
//                return buildable[fleetType].can;
//            });
//        }
//        else if (this.state.show == "later") {
//            fleetTypes = _.filter(fleetTypes, function(fleetType) {
//                return !buildable[fleetType].can;
//            });
//        }
//        
//        // Filter based on ship type
//        if (this.state.filter != "all") {
//            var filter = this.state.filter;
//            fleetTypes = _.filter(fleetTypes, function(fleetType) {
//                return _.find(buildable[fleetType].tags, function(o) {
//                    return (o == filter);
//                });
//            });
//        }
//
//
//        fleetTypes.sort();
//        var fleetTypesLen = fleetTypes.length;
//        
//        for (var i = 0; i < fleetTypesLen; i++) {
//            fleetItems.push(
//                <BuildFleetItem 
//                  fleetType =   {fleetTypes[i]} 
//                  obj =         {buildable[fleetTypes[i]] } 
//                  buildingId =  {this.props.buildingId}
//                  autoSelect =  {this.state.autoSelect}
//                />
//            );
//        }

        return (
            <div className="ui form">
              <div className="equal width fields">
                <div className="field">
                  <label>Task</label>
                  <select className="ui small dropdown" ref="task" onChange={this.handleTaskChange}>
                    <option value="All">All</option>
                    {renderFleetTasks}
                  </select>
                </div>
                <div className="field">
                  <label>Tag</label>
                  <select className="ui small dropdown" ref="tag" onChange={this.handleTagChange}>
                    <option value="All">All</option>
                    {renderFleetTags}
                  </select>
                </div>
                <div className="field">
                  <label>Type</label>
                  <select className="ui small dropdown" ref="type" onChange={this.handleTypeChange}>
                    <option value="all">All</option>
                    {renderFleetTypes}
                  </select>
                </div>
                <div className="field">
                  <label>Name</label>
                  <input type="text" ref="name" />
                </div>
              </div>
              <div className="ui divider"></div>
              <div>
                Fleet list goes here...
              </div>
            </div>
        );
    }
});

module.exports = OwnFleetsTab;
