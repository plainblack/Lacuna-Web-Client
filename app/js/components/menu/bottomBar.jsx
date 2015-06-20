'use strict';

var React = require('react');
var Reflux = require('reflux');

var BodyStore = require('js/stores/body');

var CenterBar = require('js/components/mixin/centerBar');

var util = require('js/util');

var storageStyle = {
    margin: 0,
    marginTop: '5px'
};


var BottomBar = React.createClass({
    mixins: [
        Reflux.connect(BodyStore, 'body'),
        CenterBar('bar')
    ],
    render: function() {
        return (
            <div className="ui blue inverted icon menu" ref="bar" style={{
                bottom: '40px',
                zIndex: '2000',
                position: 'fixed',
                margin: 0
            }}>

                // Food
                <div className="item" id="foodItem">
                    <i className="food big icon"></i>
                    <p style={storageStyle}>
                        {util.reduceNumber(this.state.body.food_stored)} /
                        {util.reduceNumber(this.state.body.food_capacity)}
                    </p>
                    {util.reduceNumber(this.state.body.food_hour)} / hr
                </div>

                // Ore
                <div className="item">
                    <i className="diamond big icon"></i>
                    <p style={storageStyle}>
                        {util.reduceNumber(this.state.body.ore_stored)} /
                        {util.reduceNumber(this.state.body.ore_capacity)}
                    </p>
                    {util.reduceNumber(this.state.body.ore_hour)} / hr
                </div>

                // Water
                <div className="item">
                    <i className="theme big icon"></i>
                    <p style={storageStyle}>
                        {util.reduceNumber(this.state.body.water_stored)} /
                        {util.reduceNumber(this.state.body.water_capacity)}
                    </p>
                    {util.reduceNumber(this.state.body.water_hour)} / hr
                </div>

                // Energy
                <div className="item">
                    <i className="lightning big icon"></i>
                    <p style={storageStyle}>
                        {util.reduceNumber(this.state.body.energy_stored)} /
                        {util.reduceNumber(this.state.body.energy_capacity)}
                    </p>
                    {util.reduceNumber(this.state.body.energy_hour)} / hr
                </div>

                // Waste
                <div className="item">
                    <i className="trash big icon"></i>
                    <p style={storageStyle}>
                        {util.reduceNumber(this.state.body.waste_stored)} /
                        {util.reduceNumber(this.state.body.waste_capacity)}
                    </p>
                    {util.reduceNumber(this.state.body.waste_hour)} / hr
                </div>

                // Happiness
                <div className="item">
                    <i className="smile big icon"></i>
                    <p style={storageStyle}>
                        {util.reduceNumber(this.state.body.happiness)}
                    </p>
                    {util.reduceNumber(this.state.body.happiness_hour)} / hr
                </div>

                // Plots
                <div className="item">
                    <i className="block layout big icon"></i>
                    <p style={storageStyle}>
                        {this.state.body.building_count} /
                        {this.state.body.building_count + this.state.body.plots_available} Buildings
                        <br />
                        {this.state.body.plots_available} Plots Available
                    </p>
                    {
                        // TODO: this bit can't be implemented until get_status has the data needed.
                        // {number under construction} / {developmentmMinistry level} Building
                    }
                </div>
            </div>
        );
    }
});

module.exports = BottomBar;
