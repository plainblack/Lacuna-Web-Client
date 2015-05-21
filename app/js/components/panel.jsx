'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var ReactPanels = require('react-panels');
var FloatingPanel = ReactPanels.FloatingPanel;
var Tab = ReactPanels.Tab;
var Content = ReactPanels.Content;
var Footer = ReactPanels.Footer;

var Panel = React.createClass({
    propTypes: {
        title: React.PropTypes.string.isRequired,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        onClose: React.PropTypes.func.isRequired,
        display: React.PropTypes.oneOf(['none', '']).isRequired
    },
    getDefaultProps: function() {
        return {
            height: 400
        };
    },
    render: function() {
        // TODO: figure out how to center this window on screen!
        return (
            <FloatingPanel theme="flexbox"
                style={{zIndex: '9999999999', display: this.props.display}}>
                <Tab title={this.props.title}>
                    <Content>
                        <div style={{overflow: 'auto', height: this.props.height + 'px'}}>
                            {this.props.children}
                        </div>
                    </Content>
                    <Footer>
                        <button type="button" onClick={this.props.onClose}>Close</button>
                    </Footer>
                </Tab>
            </FloatingPanel>
        );
    }
});

module.exports = Panel;
