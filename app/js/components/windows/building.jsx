'use strict';

var React = require('react');

var BuildingInformation = require('js/components/windows/building/buildingInformation');
var BuildingTabs        = require('js/components/windows/building/buildingTabs');

var Building = React.createClass({

    propTypes : {
        options : React.PropTypes.object.isRequired
    },

    statics : {
        windowOptions : {
            title  : 'Building Details',
            width  : 600,
            height : 350
        }
    },

    render : function() {
        return (
            <div>
                <BuildingInformation
                    id={this.props.options.id}
                    image={this.props.options.image}
                    level={this.props.options.level}
                    name={this.props.options.name}
                    url={this.props.options.url}
                />

                <BuildingTabs
                    id={this.props.options.id}
                    url={this.props.options.url}
                />
            </div>
        );
    }
});

module.exports = Building;
