'use strict';

var React = require('react');
var Reflux = require('reflux');

var ServerClockWindowStore = require('js/stores/window/serverClock');

var ServerClockWindow = React.createClass({
    mixins: [
        Reflux.connect(ServerClockWindowStore, 'show')
    ],
    render: function() {
        if (this.state.show) {
            YAHOO.lacuna.Info.Clock.Show();
        }

        // TODO: make this into a React component!!

        return <div></div>;
    }
});

module.exports = ServerClockWindow;
