'use strict';

var React           = require('react');
var Reflux          = require('reflux');

var StatsRPCActions = require('js/actions/rpc/stats');
var WindowActions   = require('js/actions/window');

var ServerRPCStore     = require('js/stores/rpc/server');
var TickerStore        = require('js/stores/ticker');

var Tabber          = require('js/components/tabber');
var Tabs            = Tabber.Tabs;
var Tab             = Tabber.Tab;

var ServerClock = React.createClass({
    statics : {
        options : {
            title   : 'Server Clock',
            width   : 330,
            height  : 'auto'
        }
    },
    mixins : [
        Reflux.connect(TickerStore, 'ticker'),
        Reflux.connect(ServerRPCStore, 'serverRPC')
    ],

    closeWindow : function() {
        WindowActions.windowCloseByType('serverclock');
    },

    render : function() {
        return (
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td><strong>Server</strong></td>
                            <td>{this.state.serverRPC.serverFormattedTime}</td>
                        </tr>
                        <tr>
                            <td><strong>Client</strong></td>
                            <td>{this.state.serverRPC.clientFormattedTime}</td>
                        </tr>
                        <tr>
                            <td><strong>Tick Count</strong></td>
                            <td>{this.state.ticker.clockTicks}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
});

module.exports = ServerClock;
