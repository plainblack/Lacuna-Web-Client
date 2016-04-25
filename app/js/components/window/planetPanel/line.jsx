'use strict';

var React                       = require('react');
var Reflux                      = require('reflux');
var _                           = require('lodash');

var BodyRPCGetBodyStatusStore   = require('js/stores/rpc/body/getBodyStatus');

var PlanetPanelLine             = require('js/components/window/planetPanel/line');

var util                        = require('js/util');
var constants                   = require('js/constants');
var vex                         = require('js/vex');

var PlanetDetails = React.createClass({

    mixins : [
        Reflux.connect(BodyRPCGetBodyStatusStore, 'bodyRPCGetBodyStatusStore')
    ],

    render : function() {
        var bodyStatus = this.state.bodyRPCGetBodyStatusStore;

        return (
            <div>
              {this.props.title}:
              <span
                style={{
                  float : 'right',
                }}
              >
                {this.props.value}
              </span>
            </div>
        );
    }
});

module.exports = PlanetDetails;
