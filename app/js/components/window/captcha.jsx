'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');
var _                       = require('lodash');

var CaptchaWindowActions    = require('js/actions/windows/captcha');
var WindowManagerActions    = require('js/actions/windowManager');
var CaptchaRPCActions       = require('js/actions/rpc/captcha');

var WindowActions           = require('js/actions/window');

var CaptchaRPCStore         = require('js/stores/rpc/captcha');
var clone                   = require('js/util').clone;

var Captcha = React.createClass({
    statics : {
        options : {
            title  : 'Verify Your Humanity',
            width  : 320,
            height : 'auto'
        }
    },

    propTypes : {
        options : React.PropTypes.object.isRequired
    },

    mixins : [
        Reflux.connect(CaptchaRPCStore, 'captchaRPCStore')
    ],

    componentWillMount : function() {
        CaptchaRPCActions.requestCaptchaRPCFetch();
    },

    componentWillUnmount : function() {
        var success = this.props.options.success;
        if (typeof success === 'function') {
            if (this.state.captchaRPCStore.solved) {
                success();
            }
        }
    },




    closeWindow : function() {
        WindowActions.windowClose(Captcha);
    },




    componentDidUpdate : function(prevProps, prevState) {
        if (prevState.captchaRPCStore.url !== this.state.captchaRPCStore.url) {
            this.clearSolutionField();
        }
    },

    onWindowShow : function() {
        this.clearSolutionField();
        CaptchaRPCActions.requestCaptchaRPCFetch();
    },

    handleEnterKey : function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.onClickSolve();
        }
    },

    onClickSolve : function() {
        var solution = this.refs.solution.value;
        
        CaptchaRPCActions.requestCaptchaRPCSolve({
            guid        : this.state.captchaRPCStore.guid, 
            solution    : solution
        });
    },

    onClickRefresh : function() {
        this.clearSolutionField();
        CaptchaWindowActions.captchaWindowRefresh();
    },

    onSuccessCaptchaRPCSolve : function() {
        this.onClickClose();
    },

    onClickClose : function() {
        this.clearSolutionField();
        WindowManagerActions.hideWindow(this.props.options.id);
    },

    clearSolutionField : function() {
        this.refs.solution.value = '';
    },






    render : function() {
        return (
            <div>
                <div
                    style={{
                        backgroundImage : 'url(' + this.state.captchaRPCStore.url + ')',
                        width           : 300,
                        height          : 80
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
                            width : 140
                        }}
                    />

                    <div className="ui large icon buttons">
                        <div className="ui green button" onClick={this.onClickSolve}>
                            <i className="checkmark icon"></i>
                        </div>
                        <div className="ui blue button" onClick={this.onClickRefresh}>
                            <i className="refresh icon"></i>
                        </div>
                        <div className="ui red button" onClick={this.onClickClose}>
                            <i className="remove icon"></i>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = Captcha;
