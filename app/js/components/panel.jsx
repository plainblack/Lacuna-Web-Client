'use strict';

var React = require('react');
var $ = require('js/shims/jquery');

var Draggable = require('react-draggable');

var Panel = React.createClass({
    propTypes: {
        title: React.PropTypes.string.isRequired,
        height: React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string
        ]),
        width: React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string
        ]),
        onClose: React.PropTypes.func.isRequired,
        show: React.PropTypes.bool.isRequired,
        zIndex: React.PropTypes.number
    },

    getDefaultProps: function() {
        return {
            height: 400,
            width: 450
        };
    },

    componentDidMount: function() {
        $(this.refs.container.getDOMNode()).hide();
        this.handleShowing();
    },

    componentDidUpdate: function() {
        this.handleShowing();
    },

    handleShowing: function() {
        if (this.props.show) {
            $(this.refs.container.getDOMNode()).fadeIn(500);
        } else {
            $(this.refs.container.getDOMNode()).fadeOut(500);
        }
    },

    render: function() {
        return (
            <Draggable handle='.drag-handle' zIndex={this.props.zIndex}>
                <div ref="container" style={{
                    position: 'absolute',
                    zIndex: this.props.zIndex,
                    left: ($(window.document).width() - this.props.width) / 2
                }}>
                    <div className="drag-handle" style={{
                        backgroundColor: '#184F82',
                        border: '1px solid black',
                        borderBottom: 0, // Avoid the border appearing thicker on the bottom edge.
                        borderTopLeftRadius: 7,
                        borderTopRightRadius: 7,
                        color: '#FFD800',
                        cursor: 'move',
                        fontSize: '110%',
                        fontWeight: 'bold',
                        lineHeight: '1.75',
                        marginLeft: 10,
                        paddingLeft: 10,
                        width: this.props.width - 20,

                        // Prevent anyone from selecting the text.
                        MozUserSelect: 'none',
                        WebkitUserSelect: 'none',
                        msUserSelect: 'none'
                    }}>
                        <span className="drag-handle">
                            {this.props.title}
                        </span>

                        <span
                            onClick={this.props.onClose}
                            style={{
                                position: 'absolute',
                                right: 30,
                                display: 'inline-block',
                                cursor: 'pointer'
                            }}
                        >
                            X
                        </span>
                    </div>
                    <div style={{
                        overflow: 'auto',
                        width: this.props.width + 'px',
                        border: '2px solid black',
                        backgroundColor: '#0268AC',
                        borderRadius: '10px',
                        padding: '10px'
                    }}>
                        <div style={{
                            overflow: 'auto',
                            overflowX: 'hidden',
                            height: this.props.height + 'px',
                            padding: '5px'
                        }}>
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </Draggable>
        );
    }
});

module.exports = Panel;
