'use strict';

var React        = require('react');
var $            = require('js/shims/jquery');

var Draggable    = require('react-draggable');

var PanelHeader  = require('js/components/panel/panelHeader');
var PanelContent = require('js/components/panel/panelContent');

var Panel = React.createClass({
    propTypes : {
        title : React.PropTypes.string.isRequired,

        height : React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string
        ]),
        width : React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string
        ]),

        onClose  : React.PropTypes.func.isRequired,
        zIndex   : React.PropTypes.number,
        children : React.PropTypes.element
    },

    getDefaultProps : function() {
        return {
            height : 400,
            width  : 450
        };
    },

    render : function() {
        return (
            <Draggable handle=".drag-handle" zIndex={this.props.zIndex}>
                <div ref="container" style={{
                    position : 'absolute',
                    zIndex   : this.props.zIndex,
                    left     : ($(window.document).width() - this.props.width) / 2
                }}>
                    <PanelHeader
                        title={this.props.title}
                        panelWidth={this.props.width}
                        onClose={this.props.onClose}
                    />

                    <PanelContent
                        panelWidth={this.props.width}
                        panelHeight={this.props.height}
                    >
                        {this.props.children}
                    </PanelContent>
                </div>
            </Draggable>
        );
    }
});

module.exports = Panel;
