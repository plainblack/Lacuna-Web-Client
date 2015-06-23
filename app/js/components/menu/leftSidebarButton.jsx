'use strict';

var React = require('react');
var Reflux = require('reflux');
var $ = require('js/hacks/jquery');

var EmpireRPCStore = require('js/stores/rpc/empire');
var LeftSidebarActions = require('js/actions/menu/leftSidebar');

var LeftSidebarButton = React.createClass({
    mixins: [Reflux.connect(EmpireRPCStore, 'empire')],
    render: function() {
        return (
            <div style={{
                position: 'absolute',
                zIndex: 2500,
                left: '15px',
                top: '15px'
            }}>
                <div className="ui blue big icon button" onClick={LeftSidebarActions.toggle}>
                    <i className="content icon"></i>
                </div>
                <div className="ui pointing left large teal label">
                    {this.state.empire.name}
                </div>
            </div>
        );
    }
});

module.exports = LeftSidebarButton;
