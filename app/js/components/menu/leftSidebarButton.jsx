'use strict';

var React = require('react');
var Reflux = require('reflux');

var EmpireStore = require('js/stores/empire');

var LeftSidebarButton = React.createClass({
    mixins: [Reflux.connect(EmpireStore, 'empire')],
    render: function() {
        return (
            <div style={{
                position: 'absolute',
                zIndex: 2500,
                left: '15px',
                top: '15px'
            }}>
                <div className="ui blue big icon button">
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
