'use strict';

var React = require('react');

var constants = require('js/constants');
var resources = require('js/resources');

var BuildingInformation = React.createClass({

    propTypes : {
        options : React.PropTypes.object.isRequired
    },

    getImageUrl : function() {
        return constants.ASSETS_URL + 'planet_side/100/' + this.props.options.image + '.png';
    },

    render : function() {
        return (
            <div style={{
                paddingBottom : 5,
                display       : 'inline-block'
            }}>
                <div
                    style={{
                        width           : 100,
                        height          : 100,
                        backgroundImage : 'url(' + this.getImageUrl() + ')',
                        float           : 'left'
                    }}
                />

                <div style={{
                    display    : 'inline-block',
                    marginLeft : 10,
                    width      : 550,
                    float      : 'right'
                }}>
                    <strong style={{fontSize : '1.2em'}}>
                        {this.props.options.name} {this.props.options.level} (ID: {this.props.options.id})
                    </strong>

                    <p>
                        {resources.buildings[this.props.options.url].description}
                        <br />
                        <a target="_blank" href={resources.buildings[this.props.options.url].wiki}>
                            More information on Wiki.
                        </a>
                    </p>
                </div>
            </div>
        );
    }
});

module.exports = BuildingInformation;
