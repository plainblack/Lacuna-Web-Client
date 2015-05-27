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
                position: 'absolute',
                bottom: 0,
                left: 0,
                color: '#ffffff',
                backgroundColor: '#0268AC',
                height: '25px',
                fontSize: '20px',
                zIndex: 10000
            }}>
                RPCs: {this.state.empire.rpc_count} / {this.state.server.rpc_limit}
            </div>
        );
    }
});

module.exports = RPCCount;
