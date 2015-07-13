'use strict';

var React = require('react');
var Reflux = require('reflux');

var Progress = require('react-progress');

var BodyRPCStore = require('js/stores/rpc/body');

var centerBar = require('js/components/mixin/centerBar');

var util = require('js/util');

var storageStyle = {
    margin: 0,
    marginTop: '5px'
};

var storageProgressStyle = {
    position: 'absolute'
};


var BottomBar = React.createClass({
    mixins: [
        Reflux.connect(BodyRPCStore, 'body'),
        centerBar('bar')
    ],
    render: function() {
        return (
            <div className="ui blue inverted icon menu" ref="bar" style={{
                bottom: '40px',
                zIndex: '2000',
                position: 'fixed',
                margin: 0
            }}>

                <div className="item">
                    <i className="smile big icon"></i>
                    <p style={storageStyle}>
                        {util.reduceNumber(this.state.body.happiness)}
                    </p>
                    {util.reduceNumber(this.state.body.happiness_hour)} / hr
                </div>

                <div className="item">
                    <Progress
                        percent={this.state.body.food_percent_full}
                        style={storageProgressStyle} />
                    <i className="food big icon"></i>
                    <p style={storageStyle}>
                        {
                            util.reduceNumber(this.state.body.food_stored)
                        } / {
                            util.reduceNumber(this.state.body.food_capacity)
                        }
                    </p>
                    {util.reduceNumber(this.state.body.food_hour)} / hr
                </div>

                <div className="item">
                    <Progress
                        percent={this.state.body.ore_percent_full}
                        style={storageProgressStyle} />
                    <i className="diamond big icon"></i>
                    <p style={storageStyle}>
                        {
                            util.reduceNumber(this.state.body.ore_stored)
                        } / {
                            util.reduceNumber(this.state.body.ore_capacity)
                        }
                    </p>
                    {util.reduceNumber(this.state.body.ore_hour)} / hr
                </div>

                <div className="item">
                    <Progress
                        percent={this.state.body.water_percent_full}
                        style={storageProgressStyle} />
                    <i className="theme big icon"></i>
                    <p style={storageStyle}>
                        {
                            util.reduceNumber(this.state.body.water_stored)
                        } / {
                            util.reduceNumber(this.state.body.water_capacity)
                        }
                    </p>
                    {util.reduceNumber(this.state.body.water_hour)} / hr
                </div>

                <div className="item">
                    <Progress
                        percent={this.state.body.energy_percent_full}
                        style={storageProgressStyle} />
                    <i className="lightning big icon"></i>
                    <p style={storageStyle}>
                        {
                            util.reduceNumber(this.state.body.energy_stored)
                        } / {
                            util.reduceNumber(this.state.body.energy_capacity)
                        }
                    </p>
                    {util.reduceNumber(this.state.body.energy_hour)} / hr
                </div>

                <div className="item">
                    <Progress
                        percent={this.state.body.waste_percent_full}
                        style={storageProgressStyle} />
                    <i className="trash big icon"></i>
                    <p style={storageStyle}>
                        {
                            util.reduceNumber(this.state.body.waste_stored)
                        } / {
                            util.reduceNumber(this.state.body.waste_capacity)
                        }
                    </p>
                    {util.reduceNumber(this.state.body.waste_hour)} / hr
                </div>

                <div className="item">
                    <i className="block layout big icon"></i>
                    <p style={storageStyle}>
                        {
                            this.state.body.building_count
                        } / {
                            this.state.body.building_count + this.state.body.plots_available
                        } Buildings
                        <br />
                        {this.state.body.plots_available} Plots Available
                    </p>
                </div>
            </div>
        );
    }
});

module.exports = BottomBar;
