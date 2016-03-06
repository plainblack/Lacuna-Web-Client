'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var _                       = require('lodash');

var WindowManagerStore      = require('js/stores/windowManager');

var Window                  = require('js/components/windowManager/window');

var WindowManager = React.createClass({

    mixins : [
        Reflux.connect(WindowManagerStore, 'windows')
    ],

    render : function() {
        var keys = _.keys(this.state.windows);

        var windows = _.map(keys, _.bind(function(key) {
            var theWindow = this.state.windows[key];
            return <Window window={theWindow} key={key} />;
        }, this));

        return (
            <ReactCSSTransitionGroup
                transitionName="fade"
                transitionAppearTimeout={500}
                transitionEnterTimeout={500}
                transitionLeaveTimeout={500}
                transitionAppear
            >
                {windows}
            </ReactCSSTransitionGroup>
        );
    }
});

module.exports = WindowManager;
