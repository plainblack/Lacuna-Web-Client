'use strict';

var React = require('react');
var Reflux = require('reflux');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var _ = require('lodash');

var WindowManagerActions = require('js/actions/menu/windowManager');

var WindowManagerStore = require('js/stores/menu/windowManager');

var Panel = require('js/components/panel');

var WINDOWS = {
  ABOUT:        require('js/components/window/about'),
  CAPTCHA: 	require('js/components/window/captcha'),
  ESSENTIA:     require('js/components/window/essentia'),
  INVITE:       require('js/components/window/invite'),
  MAIL:         require('js/components/window/mail'),
  NOTES:        require('js/components/window/notes'),
  OPTIONS:      require('js/components/window/options'),
  PROMOTIONS:   require('js/components/window/promotions'),
  SERVER_CLOCK: require('js/components/window/serverClock'),
  STATS:        require('js/components/window/stats')
};

var BASE_Z_INDEX = 1000000;

var Window = React.createClass({

    propTypes: {
        window: React.PropTypes.object.isRequired
    },

    componentDidMount: function() {
        this.handleDisplayCallbacks();
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (prevProps.window.show !== this.props.window.show) {
            this.handleDisplayCallbacks();
        }
    },

    handleDisplayCallbacks: function() {
        if (this.props.window.show && typeof this.refs.window.onWindowShow === 'function') {
            this.refs.window.onWindowShow();
        } else if (!this.props.window.show && typeof this.refs.window.onWindowHide === 'function') {
            this.refs.window.onWindowHide();
        }
    },

    handleBringingToTop: function(event) {
        WindowManagerActions.bringWindowToTop(this.props.window.id);
    },

    getWindowComponent: function() {
        return WINDOWS[this.props.window.type];
    },

    getWindowOptions: function() {
        var component = this.getWindowComponent();

        if (component && typeof component.windowOptions === 'object') {
            return component.windowOptions;
        } else {
            return {};
        }
    },

    render: function() {
        var onClose = function(id) {
            WindowManagerActions.hideWindow(id);
        };

        var panelOptions = _.merge({}, {
            show: this.props.window.show,
            zIndex: BASE_Z_INDEX + this.props.window.layer,
            onClose: _.partial(onClose, this.props.window.id),
            ref: 'panel'
        }, this.getWindowOptions());

        var windowOptions = {
            ref: 'window',
            options: _.merge({
                id: this.props.window.id
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

var WindowManager = React.createClass({

    mixins: [
        Reflux.connect(WindowManagerStore, 'windows')
    ],

    render: function() {
        var keys = _.keys(this.state.windows);

        var windows = _.map(keys, function(key) {
            var theWindow = this.state.windows[key];
            return <Window window={theWindow} key={key} />;
        }, this);

        return (
            <ReactCSSTransitionGroup
                transitionName="fade"
                transitionEnterTimeout={500}
                transitionLeaveTimeout={500}
                transitionAppear={true}
            >
                {windows}
            </ReactCSSTransitionGroup>
        );
    }
});

module.exports = WindowManager;
