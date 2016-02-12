'use strict';

var React = require('react');

var PanelContent = React.createClass({

    propTypes : {
        panelHeight : React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string
        ]),
        panelWidth : React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string
        ]),
        children : React.PropTypes.element
    },

    render : function() {
        return (
            <div style={{
                overflow        : 'auto',
                width           : this.props.panelWidth,
                border          : '2px solid black',
                backgroundColor : '#0268AC',
                borderRadius    : '10px',
                padding         : '10px'
            }}>
                <div style={{
                    overflow  : 'auto',
                    overflowX : 'hidden',
                    height    : this.props.panelHeight,
                    padding   : '5px'
                }}>
                    {this.props.children}
                </div>
            </div>
        );
    }
});

module.exports = PanelContent;
