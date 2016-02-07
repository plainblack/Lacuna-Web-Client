'use strict';

var React          = require('react');
var Reflux         = require('reflux');

var ServerRPCStore = require('js/stores/rpc/server');


var AboutTab = React.createClass({

    mixins: [
        Reflux.connect(ServerRPCStore, 'server')
    ],

    render: function() {
        return (
            <div>
                <h1>
                    The Lacuna Expanse
                </h1>

                <p>
                    Copyright 2010, {(new Date()).getFullYear()} Lacuna Expanse Corp.
                </p>
                <p>
                    Server Version: {this.state.server.version}.
                </p>
            </div>
        );
    }
});

module.exports = AboutTab;
