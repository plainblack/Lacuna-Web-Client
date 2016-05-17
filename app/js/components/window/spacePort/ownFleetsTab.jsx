'use strict';

var React                           = require('react');
var Reflux                          = require('reflux');
var _                               = require('lodash');
var $                               = require('js/shims/jquery');
var clone                           = require('js/util').clone;

var constants                       = require('js/constants');

var SpacePortRPCActions             = require('js/actions/rpc/spacePort');
var ViewAllFleetsSpacePortRPCStore  = require('js/stores/rpc/spacePort/viewAllFleets');

var OwnFleetItem                    = require('js/components/window/spacePort/ownFleets/item');

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
        Reflux.connect(ViewAllFleetsSpacePortRPCStore, 'viewAllFleetsStore')
    ],

    handleTaskChange : function(e) {
        this.setState( { task : e.target.value } );
    },

    handleTagChange : function(e) {
        this.setState( { tag : e.target.value } );
    },

    handleTypeChange : function(e) {
        this.setState( { type : e.target.value } );
    },

    handleNameChange : function(e) {
        this.setState( { name : e.target.value } );
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

        var fleetItems = this.state.viewAllFleetsStore.fleets.slice(0);

        // Filter based on Task
        if (this.state.task !== 'all') {
            fleetItems = $.grep(fleetItems, function(item,index) {
                return (item.task === this.state.task);
            });
        }

        // Filter based on Type
        if (this.state.type !== 'all') {
            fleetItems = $.grep(fleetItems, function(item,index) {
                return(item.details.type === this.state.type);
            });
        }

        // Filter based on Tag
        if (this.state.tag != 'all') {
            fleetItems = $.grep(fleetItems, function(item,index) {
                return(1);
            });
        }
        var renderFleetItems = [];

        for (var i = 0; i < fleetItems.length; i++) {
            renderFleetItems.push( <OwnFleetItem
              obj =         {fleetItems[i]}
              buildingId =  {this.props.buildingId}
            /> );
        }

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
                  <input type="text" ref="name" onChange={this.handleNameChange} />
                </div>
              </div>
              <div className="ui divider"></div>
              <div>
                {renderFleetItems}
              </div>
            </div>
        );
    }
});

module.exports = OwnFleetsTab;
