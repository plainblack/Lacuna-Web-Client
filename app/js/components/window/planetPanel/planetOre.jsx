'use strict';

var React                       = require('react');
var Reflux                      = require('reflux');
var _                           = require('lodash');

var BodyRPCStore                = require('js/stores/rpc/body');
var BodyRPCGetBodyStatusStore   = require('js/stores/rpc/body/getBodyStatus');

var GenericBuildingRPCActions   = require('js/actions/rpc/genericBuilding');

var PlanetDetailLine            = require('js/components/window/planetPanel/line');

var util                        = require('js/util');
var vex                         = require('js/vex');
var constants                   = require('js/constants');

var PlanetOre = React.createClass({

    mixins : [
        Reflux.connect(BodyRPCGetBodyStatusStore, 'bodyRPCGetBodyStatusStore')
    ],

    render : function() {
        var ores = constants.ORES;
        var bodyOre = this.state.bodyRPCGetBodyStatusStore.ore;

        var renderOres = [];
        for (var prop in ores) {
            if (ores.hasOwnProperty(prop)) {
                renderOres.push( <PlanetDetailLine title={ores[prop]} value={bodyOre[prop]} /> );
            }
        }

        return (
            <div className="ui grid">
              <div className="sixteen wide column">
                {renderOres}
              </div>
            </div>
        );
    }
});

module.exports = PlanetOre;
