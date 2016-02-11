'use strict';

var React     = require('react');

var ReactTabs = require('react-tabs');

var Tabs = React.createClass({

    propTypes : {
        initialTab : React.PropTypes.number,
        onSelect   : React.PropTypes.object,
        children   : React.PropTypes.element
    },

    getDefaultProps : function() {
        return {
            initialTab : 0
        };
    },

    getInitialState : function() {
        return {
            selectedTab : this.props.initialTab
        };
    },

    componentDidMount : function() {
        this.handleCallbacks(this.state.selectedTab);
    },

    handleSelect : function(index) {
        this.handleCallbacks(index);
        this.setState({
            selectedTab : index
        });
    },

    handleCallbacks : function(index) {
        if (this.props.onSelect && typeof this.props.onSelect[index] === 'function') {
            this.props.onSelect[index]();
        }
    },

    render : function() {
        return (
            <ReactTabs.Tabs
                selectedIndex={this.state.selectedTab}
                onSelect={this.handleSelect}
            >
                {this.props.children}
            </ReactTabs.Tabs>
        );
    }
});

module.exports = {
    Tab      : ReactTabs.Tab,
    TabList  : ReactTabs.TabList,
    TabPanel : ReactTabs.TabPanel,
    Tabs     : Tabs
};
