'use strict';

var React           = require('react');
var Reflux          = require('reflux');

var WindowsStore    = require('js/stores/windows');

var Windows = React.createClass({
    mixins : [
        Reflux.connect(WindowsStore, 'windows')
    ],

    render : function() {
        var windows = _.map(this.state.windows.windows, function(window) {
            return React.createElement(window, null);
        });

        return (
            <div>
                {windows}
            </div>
        );
    }
});

module.exports = Windows;
