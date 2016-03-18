'use strict';

var React                = require('react');
var _                    = require('lodash');

var WindowManagerActions = require('js/actions/windowManager');

var Panel                = require('js/components/panel');

var WINDOWS = {
//    BUILDING       : require('js/components/windows/building'),
    CAPTCHA        : require('js/components/windows/captcha'),
    ESSENTIA       : require('js/components/windows/essentia'),
    INVITE         : require('js/components/windows/invite'),
    MAIL           : require('js/components/windows/mail'),
    NOTES          : require('js/components/windows/notes'),
    OPTIONS        : require('js/components/windows/options'),
    PROMOTIONS     : require('js/components/windows/promotions'),
    SITTER_MANAGER : require('js/components/windows/sitterManager'),
    STATS          : require('js/components/windows/stats')
};

var BASE_Z_INDEX = 1000000;

var Window = React.createClass({

    propTypes : {
        window : React.PropTypes.object.isRequired
    },

    componentDidMount : function() {
        if (typeof this.refs.window.onWindowShow === 'function') {
            this.refs.window.onWindowShow();
        }
    },

    componentWillUnmount : function() {
        if (typeof this.refs.window.onWindowHide === 'function') {
            this.refs.window.onWindowHide();
        }
    },

    handleBringingToTop : function(event) {
        WindowManagerActions.bringWindowToTop(this.props.window.id);
    },

    getWindowComponent : function() {
        return WINDOWS[this.props.window.type];
    },

    getWindowOptions : function() {
        var component = this.getWindowComponent();

        if (component && typeof component.windowOptions === 'object') {
            return component.windowOptions;
        } else {
            return {};
        }
    },

    render : function() {
        var onClose = function(id) {
            WindowManagerActions.hideWindow(id);
        };

        var panelOptions = _.merge({}, {
            show    : this.props.window.show,
            zIndex  : BASE_Z_INDEX + this.props.window.layer,
            onClose : _.partial(onClose, this.props.window.id),
            ref     : 'panel'
        }, this.getWindowOptions());

        var windowOptions = {
            ref     : 'window',
            options : _.merge({
                id : this.props.window.id
            }, this.props.window.options)
        };

        return (
            <div onMouseDown={this.handleBringingToTop}>
                {
                    React.createElement(Panel, panelOptions,
                        React.createElement(this.getWindowComponent(), windowOptions)
                    )
                }
            </div>
        );
    }
});

module.exports = Window;
