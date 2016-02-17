'use strict';

var React = require('react');

var constants = require('js/constants');
var resources = require('js/resources');

var BuildingInformation = React.createClass({

    propTypes : {
        id    : React.PropTypes.string.isRequired,
        image : React.PropTypes.string.isRequired,
        level : React.PropTypes.string.isRequired,
        name  : React.PropTypes.string.isRequired,
        url   : React.PropTypes.string.isRequired
    },

    getImageUrl : function() {
        return constants.ASSETS_URL + 'planet_side/100/' + this.props.image + '.png';
    },

    render : function() {
        return (
            <div>
                <div
                    style={{
                        width           : 100,
                        height          : 100,
                        backgroundImage : 'url(' + this.getImageUrl() + ')',
                        display         : 'inline-block',
                        verticalAlign   : 'top'
                    }}
                />

                <div style={{
                    display    : 'inline-block',
                    marginLeft : 10,
                    maxWidth   : 480
                }}>
                    <strong style={{fontSize : '1.2em'}}>
                        {this.props.name} {this.props.level} (ID: {this.props.id})
                    </strong>

                    <p>
                        {resources.buildings[this.props.url].description}
                        <br />
                        <a target="_blank" href={resources.buildings[this.props.url].wiki}>
                            More information on Wiki.
                        </a>
                    </p>
                </div>
            </div>
        );
    }
});

module.exports = BuildingInformation;
