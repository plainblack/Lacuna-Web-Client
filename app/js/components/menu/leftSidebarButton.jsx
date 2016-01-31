'use strict';

var React               = require('react');
var Reflux              = require('reflux');
var $                   = require('js/shims/jquery');

var EmpireRPCStore      = require('js/stores/rpc/empire');
var LeftSidebarActions  = require('js/actions/menu/leftSidebar');

var LeftSidebarButton = React.createClass({
    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire')
    ],

    clickLeftSidebarButton: function() {
        LeftSidebarActions.show();
    },

    render: function() {
        return (
            <div style={{
                position: 'absolute',
                zIndex: 2500,
                left: '15px',
                top: '15px'
            }}>
                <div className="ui left labeled icon blue button" onClick={this.clickLeftSidebarButton}>
                    <i className="content icon" />
                    {this.state.empire.name}
                </div>
            </div>
        );
    }
});

module.exports = LeftSidebarButton;
