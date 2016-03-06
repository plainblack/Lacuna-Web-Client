'use strict';

var React              = require('react');
var Reflux             = require('reflux');

var ServerRPCStore     = require('js/stores/rpc/server');
var TickerStore        = require('js/stores/ticker');

var ServerClockWindow = React.createClass({
    mixins : [
        Reflux.connect(TickerStore, 'ticker'),
        Reflux.connect(ServerRPCStore, 'server')
    ],

    statics : {
        windowOptions : {
            title  : 'Server Clock',
            width  : 330,
            height : 'auto'
        }
    },

    render : function() {
        return (
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td><strong>Server</strong></td>
                            <td>{this.state.server.serverFormattedTime}</td>
                        </tr>
                        <tr>
                            <td><strong>Client</strong></td>
                            <td>{this.state.server.clientFormattedTime}</td>
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

module.exports = ServerClockWindow;
