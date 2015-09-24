'use strict';

var React = require('react');
var Reflux = require('reflux');
var $ = require('js/hacks/jquery');

var Progress = require('react-progress');

var BodyRPCStore = require('js/stores/rpc/body');

var centerBar = require('js/components/mixin/centerBar');

var util = require('js/util');
var Lib = window.YAHOO.lacuna.Library;

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
        centerBar('bottombar')
    ],
    calcToolTip : function(info) {
        //name, icon, iconClass, hour, store, cap
        var name = info.title || Lib.capitalizeFirstLetter(info.type);
        var icon = info.icon  || info.type;
        var iconClass = info.iconClass || name;
        var hour = this.state.body[info.type + "_hour"];
        var store = this.state.body[info.type + "_stored"] || this.state.body[info.type] || 0;
        var cap = this.state.body[info.type + "_capacity"];
        var wantCap = 'undefined' !== typeof cap;

            return [
                '<div><strong>',name,'</strong></div>',
                '<div><img alt="" class="small',iconClass,'" src="',Lib.AssetUrl,'ui/s/',icon,'.png" /> ',Lib.formatNumber(hour),'/hr</div>',
                '<div><img alt="" class="smallStorage" src="',Lib.AssetUrl,'ui/s/storage.png" />',Lib.formatNumber(Math.round(store)), (wantCap ? '/'+Lib.formatNumber(cap) : ''),'</div>',
                (wantCap ? '<div><img alt="" class="smallTime" src="'+Lib.AssetUrl+'ui/s/time.png" />' + (
                    hour < 0 && store > 0 ?
                        'Empty In '+Lib.formatTime(-3600 * store / hour) :
                    hour >= 0 && cap == store ?
                        'Full' :
                    hour > 0 ?
                        'Full In '+Lib.formatTime(3600 * (cap - store) / hour) :
                    'Will Never Fill'
                ) + '</div>' : '')
            ].join('');

    },
    componentDidUpdate: function() {
        // Now set it up.
        //$('div', this.refs.bottombar.getDOMNode()).popup('destroy').popup();
        //$('#happybar').popup({html:this.calcToolTip('Happiness','happiness','smallHappy',this.state.body.happiness_hour,this.state.body.happiness)});

    },
    componentWillUnmount: function() {
        // Destroy!
        $('div', this.refs.bottombar.getDOMNode()).popup('destroy');
    },
    render: function() {
        var This = this;
        return (
            <div className="ui blue inverted icon menu" ref="bottombar" style={{
                bottom: '40px',
                zIndex: '2000',
                position: 'fixed',
                margin: 0
            }}>

                <div id="happybar" className="item"
                onMouseEnter={function(){$('#happybar').popup({html:This.calcToolTip({type:'happiness',iconClass:"Happy"})})}}
                >
                    <i className="smile big icon"></i>
                    <p style={storageStyle}>
                        {util.reduceNumber(this.state.body.happiness)}
                    </p>
                    {util.reduceNumber(this.state.body.happiness_hour)} / hr
                </div>

                <div id="foodbar" className="item"
                onMouseEnter={function(){$('#foodbar').popup({html:This.calcToolTip({type:'food'})})}}
                >
                    <Progress
                        percent={this.state.body.food_percent_full}
                        style={storageProgressStyle} />
                    <i className="food big icon"></i>
                    <p style={storageStyle} >
                        {
                            util.reduceNumber(this.state.body.food_stored)
                        } / {
                            util.reduceNumber(this.state.body.food_capacity)
                        }
                    </p>
                    {util.reduceNumber(this.state.body.food_hour)} / hr
                </div>

                <div id="orebar" className="item"
                onMouseEnter={function(){$('#orebar').popup({html:This.calcToolTip({type:'ore'})})}}
                >
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

                <div id="waterbar" className="item"
                onMouseEnter={function(){$('#waterbar').popup({html:This.calcToolTip({type:'water'})})}}
                >
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

                <div id="energybar" className="item"
                onMouseEnter={function(){$('#energybar').popup({html:This.calcToolTip({type:'energy'})})}}
                >
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

                <div id="wastebar" className="item"
                onMouseEnter={function(){$('#wastebar').popup({html:This.calcToolTip({type:'waste'})})}}
                >
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
