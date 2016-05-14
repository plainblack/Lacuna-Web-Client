'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var util                    = require('js/util');
var constants               = require('js/constants');

var BuildFleetItem = React.createClass({

    propTypes : {
        obj :           React.PropTypes.object.isRequired,
        buildingId :    React.PropTypes.number.isRequired
    },

    render : function() {
        var starfieldStyle = {
            width:  100,
            height: 100,
            background: "transparent url("+constants.ASSETS_URL+"star_system/field.png) no-repeat center",
        };
        var shipImage = constants.ASSETS_URL+"ships/hulk.png";
        var reason = '';
        return (
          <div>
            <div className="ui grid">

              <div className="four wide column">
                <div style={starfieldStyle}>
                  <img src={ shipImage } style={{ width:100, height:100 }} className="shipImage" />
                </div>
              </div>

              <div className="four wide column">
                Resources
              </div>
              <div className="four wide column">
                Resource Attributes
              </div>

              <div className="four wide column">
                buttons
              </div>
            </div>

          <div className="ui divider" />
        </div>
        );
    }
});

module.exports = BuildFleetItem;
