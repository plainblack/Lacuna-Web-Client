'use strict';

var React           = require('react');
var Reflux          = require('reflux');

var WindowsStore    = require('js/stores/windows');
var Panel           = require('js/components/window/panel');

var Windows = React.createClass({
    mixins : [
        Reflux.connect(WindowsStore, 'windows')
    ],

    render : function() {
        var windows = _.map(this.state.windows.windows, function(window,index) {
            return (
                <Panel window={window} zIndex={1000000+index} /> 
            );
        });

        return (
            <div>
                {windows}
            </div>
        );
    }
});

module.exports = Windows;
