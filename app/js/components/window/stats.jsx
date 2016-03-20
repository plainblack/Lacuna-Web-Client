'use strict';

var React            = require('react');
var Reflux           = require('reflux');

var StatsWindowStore = require('js/stores/windows/stats');

var StatsWindow = React.createClass({
    mixins : [
        Reflux.connect(StatsWindowStore, 'statsWindow')
    ],
    render : function() {
        if (this.state.statsWindow.show) {
            YAHOO.lacuna.Stats.show();
        }

        // TODO: make this into a React component!!

        return <div></div>;
    }
});

module.exports = StatsWindow;
