'use strict';

var React = require('react');
var Reflux = require('reflux');
var $ = require('js/hacks/jquery');

var InviteActions = require('js/actions/window/invite');

var InviteWindowStore = require('js/stores/window/invite');

var Panel = require('js/components/panel');

var server = require('js/server');

var InviteWindow = React.createClass({
    mixins: [
        Reflux.connect(InviteWindowStore, 'show')
    ],

    invite: function() {
        var email = this.refs.email.getDOMNode().value;
        var message = this.refs.message.getDOMNode().value;

        server.call({
            module: 'empire',
            method: 'invite_friend',
            params: [email, message],
            success: function() {
                alert('Sent!');
            }
        });
    },

    genLink: function() {
        server.call({
            module: 'empire',
            method: 'get_invite_friend_url',
            params: [],
            success: function(result) {
                $(this.refs.referral.getDOMNode()).val(result.referral_url);
            },
            scope: this
        });
    },

    componentDidUpdate: function() {
        var $el = $(this.refs.referral.getDOMNode());

        $el.off().click(function() {
            $(this).select();
        });
    },

    render: function() {
        var defaultMessage = [
            "I'm having a great time with this new game called 'Lacuna Expanse'.",
            "Come play with me!"
        ].join(' ');

        return (
            <Panel
                title="Invite A Friend"
                onClose={InviteActions.hide}
                show={this.state.show}
            >
                <div className="ui form">
                    <div className="field">
                        <label style={{color: '#ffffff'}}>Email</label>
                        <input type="text" placeholder="someone@example.com" ref="email"></input>
                    </div>

                    <div className="field">
                        <label style={{color: '#ffffff'}}>Message</label>
                        <textarea ref="message" defaultValue={defaultMessage}></textarea>
                    </div>

                    <div className="ui green button" onClick={this.invite}>Send Invite</div>
                </div>

                <div className="ui divider"></div>

                <div className="ui fluid action input" ref="referralContainer">
                    <input type="text" readonly="readonly" placeholder="Referal link" ref="referral">
                        <button className="ui blue button" onClick={this.genLink}>Generate</button>
                    </input>
                </div>
            </Panel>
        );
    }
});

module.exports = InviteWindow;
