'use strict';

var React                       = require('react');
var Reflux                      = require('reflux');
var _                           = require('lodash');

var BodyRPCStore                = require('js/stores/rpc/body');
var GenericBuildingRPCActions   = require('js/actions/rpc/genericBuilding');

var ActionButton                = require('js/components/window/building/actionButton');
var ResourceProduction          = require('js/components/window/building/resourceProduction');
var ResourceCost                = require('js/components/window/building/resourceCost');
var ResourceLine                = require('js/components/window/building/resourceLine');

var util                        = require('js/util');
var vex                         = require('js/vex');

var PlanetDetails = React.createClass({

    mixins : [
        Reflux.connect(BodyRPCStore, 'bodyRPCStore'),
    ],

    render : function() {

        return (
            <div className="ui grid">
              <div className="eight wide column">
                To Be Defined
              </div>
            </div>
        );
    }
});

module.exports = PlanetDetails;
