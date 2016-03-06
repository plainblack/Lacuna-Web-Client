'use strict';

var React     = require('react');
var _         = require('lodash');
var ReactTabs = require('react-tabs');

var Tabs = React.createClass({

    propTypes : {
        initialTab : React.PropTypes.number,
        onSelect   : React.PropTypes.object,
        children   : React.PropTypes.node
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

    getCallbacks : function() {
        var obj = {};
        var i   = 0;

        React.Children.forEach(this.props.children, function(child) {

            if (!child) {
                return;
            }

            if (child.props && typeof child.props.onSelect === 'function') {
                obj[i] = child.props.onSelect;
            }

            i += 1;
        });

        return obj;
    },

    handleCallbacks : function(index) {
        var callbacks = this.getCallbacks();

        if (callbacks && typeof callbacks[index] === 'function') {
            callbacks[index]();
        }
    },

    render : function() {
        var tabTitles = [];
        var tabContents = [];

        React.Children.forEach(this.props.children, function(child) {
            if (child.props && child.props.title && child.props.children) {
                tabTitles.push(child.props.title);
                tabContents.push(child.props.children);
            }
        });

        return (
            <ReactTabs.Tabs
                selectedIndex={this.state.selectedTab}
                onSelect={this.handleSelect}
            >
                <ReactTabs.TabList>
                    {
                        _.map(tabTitles, function(title) {
                            return (
                                <ReactTabs.Tab key={title}>
                                    {title}
                                </ReactTabs.Tab>
                            );
                        })
                    }
                </ReactTabs.TabList>

                {
                    _.map(tabContents, function(tabContent, i) {
                        var title = tabTitles[i];

                        return (
                            <ReactTabs.TabPanel key={title}>
                                {tabContent}
                            </ReactTabs.TabPanel>
                        );
                    })
                }
            </ReactTabs.Tabs>
        );
    }
});

module.exports = Tabs;
