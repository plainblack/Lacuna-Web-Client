'use strict';

var React = require('react');
var Reflux = require('reflux');

var moment = require('moment');

var ServerClockActions = require('js/actions/window/serverClock');

var ServerClockWindowStore = require('js/stores/window/serverClock');
var ServerRPCStore = require('js/stores/rpc/server');

var Panel = require('js/components/panel');

var util = require('js/util');

var ServerClockWindow = React.createClass({
    mixins: [
        Reflux.connect(ServerClockWindowStore, 'show'),
        Reflux.connect(ServerRPCStore, 'server')
    ],

    render: function() {
        return (
            <Panel
                title="Server Clock"
                show={this.state.show}
                onClose={ServerClockActions.hide}
                width={320}
                height={50}
            >
                <p><strong>Server:</strong> {this.state.server.displayTime}</p>
                <p><strong>Here:</strong> {util.formatMomentLong(moment())}</p>
            </Panel>
        );
    }
});

module.exports = ServerClockWindow;
