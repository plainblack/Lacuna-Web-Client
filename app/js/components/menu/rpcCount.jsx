'use strict';

var React = require('react');
var Reflux = require('reflux');

var ServerStore = require('js/stores/server');
var EmpireStore = require('js/stores/empire');

var RPCCount = React.createClass({
    mixins: [
        Reflux.connect(ServerStore, 'server'),
        Reflux.connect(EmpireStore, 'empire')
    ],
    render: function() {
        return (
            <div style={{
                color: 'black',
                position: 'absolute',
                bottom: '25px',
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
