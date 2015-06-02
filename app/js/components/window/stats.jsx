'use strict';

var React = require('react');
var Reflux = require('reflux');

var StatsStore = require('js/stores/window/stats');

var StatsWindow = React.createClass({
    mixins: [Reflux.connect(StatsStore, 'show')],
    getInitialState: function() {
        return {
            show: false
        };
    },
    render: function() {
        if (this.state.show) {
            YAHOO.lacuna.Stats.show();
        }

        // TODO: make this into a React component!!

        return <div></div>;
    }
});

module.exports = StatsWindow;
