'use strict';

var React = require('react');
var Reflux = require('reflux');

var ServerStore = require('js/stores/server');
var EmpireStore = require('js/stores/empire');

// NOTE: this *was* implemented just before the introduction of the new UI. I (1vasari) will find a
// place for it sometime. :P

var RPCCount = React.createClass({
    mixins: [
        Reflux.connect(ServerStore, 'server'),
        Reflux.connect(EmpireStore, 'empire')
    ],
    render: function() {
        return (
            <div style={{
                color: '#ffffff',
                left: '350px',
                position: 'absolute',
                marginTop: '8px',
                fontSize: '1.2em',
                zIndex: '2000' // Make sure it's on top.
            }}>
                RPCs:
                <br />
                {this.state.empire.rpc_count} / {this.state.server.rpc_limit}
            </div>
        );
    }
});

module.exports = RPCCount;
