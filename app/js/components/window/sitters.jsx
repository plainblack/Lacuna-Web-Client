'use strict';

var React = require('react');
var Reflux = require('reflux');

var SittersActions = require('js/actions/window/sitters');

var SittersWindowStore = require('js/stores/window/sitters');
var SittersRPCStore = require('js/stores/rpc/empire/sitters');

var Panel = require('js/components/panel');

var SittersWindow = React.createClass({
    mixins: [
        Reflux.connect(SittersWindowStore, 'show'),
        Reflux.connect(SittersRPCStore, 'sitters')
    ],
    render: function() {
        console.log(this.state.sitters);

        return (
            <Panel
                title="Manage Sitters"
                onClose={SittersActions.hide}
                show={this.state.show}
            >
                Hello!
            </Panel>
        );
    }
});

module.exports = SittersWindow;
