'use strict';

var React = require('react');

var BuildingCountToolTip = React.createClass({
    render : function() {
        return (
            <div>
                Your current <a target="_new" href="http://community.lacunaexpanse.com/wiki/plots">plot-using</a> building count, and how many <a target="_new" href="http://community.lacunaexpanse.com/wiki/plots">plots</a> you have available.
            </div>
        );
    }
});

module.exports = BuildingCountToolTip;
