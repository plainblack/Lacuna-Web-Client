'use strict';

var React = require('react');
var Reflux = require('reflux');

var InviteStore = require('js/stores/window/invite');

var InviteWindow = React.createClass({
    mixins: [Reflux.connect(InviteStore, 'show')],
    getInitialState: function() {
        return {
            show: false
        };
    },
    render: function() {
        if (this.state.show) {
            YAHOO.lacuna.Invite.show();
        }

        // TODO: make this into a React component!!

        return <div></div>;
    }
});

module.exports = InviteWindow;
