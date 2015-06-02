'use strict';

var React = require('react');
var Reflux = require('reflux');

var BodyStore = require('js/stores/body');

var RightSidebarButton = React.createClass({
    mixins: [Reflux.connect(BodyStore, 'body')],
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
                <div className="ui blue big icon button">
                    <i className="world icon"></i>
                </div>
            </div>
        );
    }
});

module.exports = RightSidebarButton;
