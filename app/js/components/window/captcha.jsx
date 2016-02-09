'use strict';

var React = require('react');
var Reflux = require('reflux');

var CaptchaActions = require('js/actions/window/captcha');
var WindowManagerActions = require('js/actions/menu/windowManager');

var CaptchaRPCStore = require('js/stores/rpc/captcha');

var Captcha = React.createClass({
    propTypes: {
        options: React.PropTypes.object.isRequired
    },

    mixins: [
        Reflux.connect(CaptchaRPCStore, 'captcha')
    ],

    statics: {
        windowOptions: {
            title: 'Verify Your Humanity',
            width: 320,
            height: 'auto'
        }
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (prevState.captcha.url !== this.state.captcha.url) {
            this.clearSolutionField();
        }
    },

    onWindowShow: function() {
        this.clearSolutionField();
        CaptchaActions.fetch();
    },

    onWindowHide: function() {
        this.clearSolutionField();
        CaptchaActions.clear();
    },

    handleEnterKey: function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.onSolveClick();
        }
    },

    onSolveClick: function() {
        var solution = this.refs.solution.value;
        var success = this.props.options.success;

        CaptchaActions.solve(solution, _.bind(function() {
            if (typeof success === 'function') {
                success();
                this.onCloseClick();
            }
        }, this));
    },

    onRefreshClick: function() {
        this.clearSolutionField();
        CaptchaActions.refresh();
    },

    onCloseClick: function() {
        this.clearSolutionField();
        WindowManagerActions.hideWindow(this.props.options.id);
    },

    clearSolutionField: function() {
        this.refs.solution.value = '';
    },

    render: function() {
        return (
            <div>
                <div
                    style={{
                        backgroundImage: 'url(' + this.state.captcha.url + ')',
                        width: 300,
                        height: 80
                    }}
                />

                <br />

                <div className="ui action input">
                    <input
                        type="text"
                        ref="solution"
                        onKeyDown={this.handleEnterKey}
                        placeholder="Captcha Solution"
                        style={{
                            // Magic number to make it the same width as the image.
                            width: 140
                        }}
                    />

                    <div className="ui large icon buttons">
                        <div className="ui green button" onClick={this.onSolveClick}>
                            <i className="checkmark icon"></i>
                        </div>
                        <div className="ui blue button" onClick={this.onRefreshClick}>
                            <i className="refresh icon"></i>
                        </div>
                        <div className="ui red button" onClick={this.onCloseClick}>
                            <i className="remove icon"></i>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = Captcha;
