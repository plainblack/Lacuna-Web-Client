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
        var windows = _.map(this.state.windows.windows, function(row,index) {
            if (row && row.window) {
                return (
                    <Panel window={row.window} type={row.type} options={row.options} zIndex={row.zIndex} /> 
                );
            }
            return;
        });

        return (
            <div>
                {windows}
            </div>
        );
    }
});

module.exports = Windows;
