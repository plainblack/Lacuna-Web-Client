'use strict';

var React                       = require('react');
var Reflux                      = require('reflux');
var _                           = require('lodash');

var BodyRPCStore                = require('js/stores/rpc/body');
var GenericBuildingRPCActions   = require('js/actions/rpc/genericBuilding');

var PlanetDetails               = require('js/components/window/planetPanel/planetDetails');
var PlanetOre                   = require('js/components/window/planetPanel/planetOre');

var util                        = require('js/util');
var vex                         = require('js/vex');

var PlanetDetailsTab = React.createClass({

    mixins : [
        Reflux.connect(BodyRPCStore, 'bodyRPCStore'),
    ],

    render : function() {

        return (
            <div className="ui grid">

                <div className="ui centered row">
                    <div className="eight wide column">
                        <div style={{
                            textAlign  : 'center',
                            fontWeight : 'bold'
                        }}>
                            Planet Details
                        </div>
                    </div>
                    <div className="eight wide column">
                        <div style={{
                            textAlign  : 'center',
                            fontWeight : 'bold'
                        }}>
                            Ore
                        </div>
                    </div>
                </div>

                <div className="ui centered row">
                    <div className="eight wide column">
                        <PlanetDetails />
                    </div>
                    <div className="eight wide column">
                        <PlanetOre />
                    </div>
                </div>

            </div>
        );
    }
});

module.exports = PlanetDetailsTab;
