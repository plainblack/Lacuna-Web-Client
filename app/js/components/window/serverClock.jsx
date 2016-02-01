'use strict';

var React = require('react');
var Reflux = require('reflux');

var ServerRPCStore = require('js/stores/rpc/server');

var ServerClockWindow = React.createClass({
    mixins: [
        Reflux.connect(ServerRPCStore, 'server')
    ],

    statics: {
        windowOptions: {
            title: 'Server Clock',
            width: 320,
            height: 50
        }
    },

    render: function() {
        return (
            <div>
                <p><strong>Server:</strong> {this.state.server.serverFormattedTime}</p>
                <p><strong>Here:</strong> {this.state.server.clientFormattedTime}</p>
            </div>
        );
    }
});

module.exports = ServerClockWindow;
