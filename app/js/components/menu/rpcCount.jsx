'use strict';

var React = require('react');
var Reflux = require('reflux');
var Radium = require('radium');

var ServerRPCStore = require('js/stores/rpc/server');
var EmpireRPCStore = require('js/stores/rpc/empire');

var RPCCount = React.createClass({
    mixins: [
        Reflux.connect(ServerRPCStore, 'server'),
        Reflux.connect(EmpireRPCStore, 'empire')
    ],

    pad: function(str) {
        return str.split('').join(' ').toUpperCase();
    },

    render: function() {
        var count = this.state.empire.rpc_count;
        var limit = this.state.server.rpc_limit;

        // Doing this weird stuff allows the text to be stacked vertically.
        // See http://code.tutsplus.com/tutorials/the-easiest-way-to-create-vertical-text-with-css--net-15284
        var str = this.pad('actions-' + count + '/' + limit);

        return (
            <div style={{
                color: 'black',
                position: 'absolute',
                top: 100,
                left: 15,
                backgroundColor: 'yellow',
                zIndex: 10000,
                padding: 5,
                borderRadius: 2,
                opacity: 0.45,

                width: '1em',
                letterSpacing: 20,
                fontFamily: 'monospace',

                ':hover': {
                    opacity: 1
                }
            }}>
                {str}
            </div>
        );
    }
});

module.exports = Radium(RPCCount);
