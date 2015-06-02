'use strict';

var React = require('react');
var Reflux = require('reflux');

var MailStore = require('js/stores/window/mail');

var MailWindow = React.createClass({
    mixins: [Reflux.connect(MailStore, 'show')],
    getInitialState: function() {
        return {
            show: false
        };
    },
    render: function() {
        if (this.state.show) {
            YAHOO.lacuna.Messaging.show();
        }

        // TODO: make this into a React component!!

        return <div></div>;
    }
});

module.exports = MailWindow;
