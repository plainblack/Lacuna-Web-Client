'use strict';

var React = require('react');
var Reflux = require('reflux');
var $ = require('js/shims/jquery');

var BodyRPCStore = require('js/stores/rpc/body');
var RightSidebarActions = require('js/actions/menu/rightSidebar')

var RightSidebarButton = React.createClass({

    mixins: [
        Reflux.connect(BodyRPCStore, 'body')
    ],

    click: function() {
        RightSidebarActions.show();
    },

    render: function() {
        return (
            <div style={{
                position: 'absolute',
                zIndex: 2500,
                right: '15px',
                top: '15px'
            }}>
                <div className="ui right labeled icon blue button" onClick={this.click}>
                    <i className="world icon" />
                    {this.state.body.name}
                </div>
            </div>
        );
    }
});

module.exports = RightSidebarButton;
