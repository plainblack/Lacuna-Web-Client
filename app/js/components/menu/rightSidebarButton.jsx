'use strict';

var React = require('react');
var Reflux = require('reflux');
var $ = require('js/hacks/jquery');

var BodyRPCStore = require('js/stores/rpc/body');
var RightSidebarActions = require('js/actions/menu/rightSidebar')

var RightSidebarButton = React.createClass({
    mixins: [Reflux.connect(BodyRPCStore, 'body')],
    render: function() {
        return (
            <div style={{
                position: 'absolute',
                zIndex: 2500,
                right: '15px',
                top: '15px'
            }}>
                <div className="ui pointing right large teal label">
                    {this.state.body.name}
                </div>
                <div className="ui blue big icon button" onClick={RightSidebarActions.toggle}>
                    <i className="world icon"></i>
                </div>
            </div>
        );
    }
});

module.exports = RightSidebarButton;
