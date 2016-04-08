'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var ResourceLine            = require('js/components/window/shipyard/resourceLine');
var ResourceAttribute       = require('js/components/window/shipyard/resourceAttribute');
var BuildButton             = require('js/components/window/shipyard/buildButton');

var util                    = require('js/util');

var BuildFleetItem = React.createClass({

    propTypes : {
        fleetType :     React.PropTypes.string.isRequired,
        obj :           React.PropTypes.object.isRequired,
        buildingId :    React.PropTypes.number.isRequired,
        autoSelect :    React.PropTypes.string.isRequired
    },

    handleQuantity : function(o) {
    },

    render : function() {
        var starfieldStyle = {
            width:  100,
            height: 100,
            background: "transparent url(//d16cbq0l6kkf21.cloudfront.net/assets/star_system/field.png) no-repeat center",
        };
        var obj = this.props.obj
        var shipImage = "//d16cbq0l6kkf21.cloudfront.net/assets/ships/"+this.props.fleetType+".png";
        var reason = '';
        var canBuild = 1;
        if (obj.reason) {
            reason = obj.reason[1];
            canBuild = 0;
        }
        return (
          <div>
            <div className="ui grid">
              <div className="four wide column">
                <div>{obj.type_human}</div>
                <div style={starfieldStyle}>
                  <img src={ shipImage } style={{ width:100, height:100 }} className="shipImage" />
                </div>
              </div>
              <div className="four wide column">
                <ResourceLine
                  icon={"food"}
                  cost={obj.cost.food}
                />
                <ResourceLine
                  icon={"diamond"}
                  cost={obj.cost.ore}
                />
                <ResourceLine
                  icon={"theme"}
                  cost={obj.cost.water}
                />
                <ResourceLine
                  icon={"lightning"}
                  cost={obj.cost.energy}
                />
                <ResourceLine
                  icon={"wait"}
                  cost={obj.cost.time}
                />
                

              </div>
              <div className="four wide column">
                <ResourceAttribute
                  name={"Speed"}
                  attr={obj.attributes.speed}
                />
                <ResourceAttribute
                  name={"Berth Level"}
                  attr={obj.attributes.berth_level}
                />
                <ResourceAttribute
                  name={"Hold Size"}
                  attr={obj.attributes.hold_size}
                />
                <ResourceAttribute
                  name={"Max Occupants"}
                  attr={obj.attributes.max_occupants}
                />
                <ResourceAttribute
                  name={"Combat"}
                  attr={obj.attributes.combat}
                />
                <ResourceAttribute
                  name={"Stealth"}
                  attr={obj.attributes.stealth}
                />

              </div>
              <div className="four wide column">
                <BuildButton 
                  canBuild={canBuild} 
                  obj={obj} 
                  buildingId={this.props.buildingId} 
                  fleetType={this.props.fleetType}
                  autoSelect={this.props.autoSelect}
                />

              </div>
              <div className="sixteen wide column">
                <span
                  style={{
                    float : 'right',
                    color : 'red'
                  }}
                  title={reason}
                >
                  {reason}
                </span>
              </div>
            </div>



          <div className="ui divider" />
        </div>
        );
    }
});

module.exports = BuildFleetItem;
