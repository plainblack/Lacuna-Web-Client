'use strict';

var React = require('react');
var Reflux = require('reflux');
var $ = require('js/hacks/jquery');

var Progress = require('react-progress');

var BodyRPCStore = require('js/stores/rpc/body');
var ServerRPCStore = require('js/stores/rpc/server');
var EmpireRPCStore = require('js/stores/rpc/empire');

var centerBar = require('js/components/mixin/centerBar');

var util = require('js/util');
var int  = util.int;
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
        Reflux.connect(ServerRPCStore, 'server'),
        Reflux.connect(EmpireRPCStore, 'empire'),
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
                '<div><img alt="" class="smallStorage" src="',Lib.AssetUrl,'ui/s/storage.png" />',Lib.formatNumber(Math.round(store)), (wantCap ? ' / '+Lib.formatNumber(cap) : ''),'</div>',
                '<div><img alt="" class="small',iconClass,'" src="',Lib.AssetUrl,'ui/s/',icon,'.png" /> ',Lib.formatNumber(hour),' / hr</div>',
                (wantCap ? '<div><img alt="" class="smallTime" src="'+Lib.AssetUrl+'ui/s/time.png" />' + (
                    hour < 0 && store > 0 ?
                        'Empty In '+Lib.formatTime(-3600 * store / hour) :
                    hour >= 0 && cap == store ?
                        'Full' :
                    hour > 0 ?
                        'Full In '+Lib.formatTime(3600 * (cap - store) / hour) :
                    'Will Never Fill'
                ) + '</div>' : ''),
                info.happy_boost
            ].join('');

    },
    componentWillUnmount: function() {
        // Destroy!
        $('div', this.refs.bottombar.getDOMNode()).popup('destroy');
    },
    render: function() {
        var This = this;
        var happy_boost = 0;
        // These numbers could be retrieved from the server, but for now, server changes
        // must be duplicated here so that the formulas match.
        if (this.state.body.happiness < 0) {
            happy_boost = '<i class="caret down small icon" />-' + int(150*Math.log(-this.state.body.happiness)/Math.log(1000)*10)/10;
        }
        else if (this.state.body.happiness > 0) {
            happy_boost = '<i class="caret up small icon" />' + int(4*Math.log(this.state.body.happiness)/Math.log(1000)*10)/10;
        }
        happy_boost = ['<div><img alt="" class="smallHappy" src="' + Lib.AssetUrl + 'ui/s/build.png"/ > '+happy_boost+'%</div>'];

        return (
            <div className="ui blue inverted icon menu" ref="bottombar" style={{
                bottom: '40px',
                zIndex: '2000',
                position: 'fixed',
                margin: 0
            }}>

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

                <div id="happybar" className="item"
                onMouseEnter={function(){$('#happybar').popup({html:This.calcToolTip({type:'happiness',iconClass:"Happy",happy_boost:happy_boost})})}}
                >
                    <i className="smile big icon"></i>
                    <p style={storageStyle}>
                        {util.reduceNumber(this.state.body.happiness)}
                    </p>
                    {util.reduceNumber(this.state.body.happiness_hour)} / hr
                </div>

                <div id="buildingcountbar" className="item"
                onMouseEnter={function(){$('#buildingcountbar').popup({html:"How many <a target='_new' href='http://community.lacunaexpanse.com/wiki/plots'>plots</a> you have available.",hoverable:true,delay:{hide:800}})}}>
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

                <div id="buildqueuebar" className="item"
                onMouseEnter={function(){$('#buildqueuebar').popup({html:"How many <a target='_new' href='http://community.lacunaexpanse.com/wiki/development-ministry'>buildings are queued or can be queued</a>.",hoverable:true,delay:{hide:800}})}}>
                    <i className="list big icon" />
                    <p style={storageStyle}>
                        { this.state.body.build_queue_len } / {this.state.body.build_queue_size }
                    <br />Constructing
                    </p>
                </div>

                <div id="rpcusagebar" className="item"
                onMouseEnter={function(){$('#rpcusagebar').popup({html:"The <a target='_new' href='http://community.lacunaexpanse.com/wiki/rpc-limit'>RPC limit</a> is the number of requests you can send to the server in a 24 hour period.",hoverable:true,delay:{hide:800}})}}>
                    <i className="exchange big icon" />
                    <p style={storageStyle}>
                        {this.state.empire.rpc_count} / {this.state.server.rpc_limit}
                    <br />Actions (RPCs)
                    </p>
                </div>
            </div>
        );
    }
});

module.exports = BottomBar;
