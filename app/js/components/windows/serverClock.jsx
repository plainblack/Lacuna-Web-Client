'use strict';

var React              = require('react');
var Reflux             = require('reflux');

var ServerTimeRPCStore = require('js/stores/rpc/server/time');
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
            width  : 300,
            height : 'auto'
        }
    },

    render : function() {
        return (
            <div>
                <p><strong>Server:</strong> {ServerTimeRPCStore.getCurrentServerTimeFormatted()}</p>
                <p><strong>Here:</strong> {ServerTimeRPCStore.getCurrentClientTimeFormatted()}</p>
                <p>{this.state.ticker.time}</p>
            </div>
        );
    }
});

module.exports = ServerClockWindow;
