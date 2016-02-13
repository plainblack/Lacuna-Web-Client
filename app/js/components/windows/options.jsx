'use strict';

var React              = require('react');
var Reflux             = require('reflux');

var OptionsWindowStore = require('js/stores/windows/options');

var OptionsWindow = React.createClass({
    mixins : [
        Reflux.connect(OptionsWindowStore, 'show')
    ],
    render : function() {
        if (this.state.show) {
            YAHOO.lacuna.Profile.show();
        }

        // TODO: make this into a React component!!

        return <div></div>;
    }
});

module.exports = OptionsWindow;
