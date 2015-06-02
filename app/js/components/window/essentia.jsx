'use strict';

var React = require('react');
var Reflux = require('reflux');

var EssentiaStore = require('js/stores/window/essentia');

var EssentiaWindow = React.createClass({
    mixins: [Reflux.connect(EssentiaStore, 'show')],
    getInitialState: function() {
        return {
            show: false
        };
    },
    render: function() {
        if (this.state.show) {
            YAHOO.lacuna.Essentia.show();
        }

        // TODO: make this into a React component!!

        return <div></div>;
    }
});

module.exports = EssentiaWindow;
