'use strict';

var React = require('react');
var Reflux = require('reflux');

var ServerRPCStore = require('js/stores/rpc/server');
var EmpireRPCStore = require('js/stores/rpc/empire');

var RPCCount = React.createClass({
    mixins: [
        Reflux.connect(ServerRPCStore, 'server'),
        Reflux.connect(EmpireRPCStore, 'empire')
    ],
    render: function() {
        return (
            <div id="RPCCount" style={{
                color: 'black',
                position: 'absolute',
                bottom: '40px',
                left: '15px',
                backgroundColor: 'yellow',
                zIndex: '10000',
                padding: '5px',
                borderRadius: '2px'
            }} title="Number of clicks you've made this 24 hour period.">
                RPCs: {this.state.empire.rpc_count} / {this.state.server.rpc_limit}
            </div>
        );
    }
});

module.exports = RPCCount;
