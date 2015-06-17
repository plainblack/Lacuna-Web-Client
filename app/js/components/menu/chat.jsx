'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var ChatStore = require('js/stores/menu/chat');

var Chat = React.createClass({
    mixins: [
        Reflux.connect(ChatStore, 'show')
    ],
    getInitialState: function() {
        return {
            show: false
        };
    },
    hasRenderedChat: false,
    componentDidUpdate: function() {

        // Only do this process once.
        if (this.props.show === false || this.hasRenderedChat === true) {
            return;
        }

        console.log('Loading chat!');

        if (!window.ChiselChat) {
            // ChiselChat is not on mpn so we need to pull some tricks to get it into the app.

            // Firstly, add all its dependencies to `window`.
            window.Firebase = require('firebase');
            window.$ = window.jQuery = require('jquery');
            window.PNotify = require('pnotify');

            // Now manually load the script.
            var self = this;
            $.getScript('chiselchat/chiselchat.min.js', function(data, textStatus, jqXHR) {
                if (textStatus === 'success' && jqXHR.status === 200) {
                    self.renderChat.call(self);
                }
            });
        }
    },
    renderChat: function() {

        // Only do this process once.
        // NOTE: it's checked before but we're just making sure. (nice rhyming)
        if (this.hasRenderedChat === true) {
            return;
        }

        console.log('Rendering chat!');

        try {

            var config = {
                maxNumMessages: 100
            };

            this.chatRef = new Firebase('https://lacuna.firebaseio.com');
            this.chat = new ChiselchatUI(this.chatRef, this.refs.chatWrapper.getDOMNode(), config);

            this.chat.addCommand({
                match : /^\/wiki/,
                func : function(e) {
                    var msg = e.content.replace(/^\/wiki/, "");
                    msg = msg.trim();
                    if (msg.length) {
                        e.content = "http://community.lacunaexpanse.com/wiki?func=search&query="+msg;
                    }
                    else {
                        e.content = "http://community.lacunaexpanse.com/wiki";
                    }
                },
                name : "/wiki",
                help : "Quick link to the Lacuna Expanse wiki.",
                moderatorOnly : false
            });

            this.chat.addCommand({
                match : /^\/planet$/,
                func : function(message, chatui) {
                    var Game = YAHOO.lacuna.Game;
                    var body = Game.GetCurrentPlanet();
                    message.content = "My current planet is '"+body.name+"' at '"+body.x+"|"+body.y+"' in zone '"+body.zone+"'";
                },
                name : "/planet",
                help : "Show everyone where your current planet is.",
                moderatorOnly : false
            });

            this.authenticateChat();

        } catch (err) {
            // We got an error, but do nothing about it.
            console.error(err);
        }

    },
    authenticateChat: function() {

        // Only do this process once.
        // NOTE: it's checked before but we're just making sure. (nice rhyming)
        if (this.hasRenderedChat === true) {
            return;
        }

        var Game = YAHOO.lacuna.Game;

        Game.Services.Chat.init_chat({
            session_id: Game.GetSession()
        }, {
            success : _.bind(function(o) {

                if (!this.chat) {
                    return true;
                }

                var result = o.result;
                this.chat_auth = result.chat_auth;
                this.gravatar_url = result.gravatar_url;
                this.private_room = result.private_room;

                this.chatRef.authWithCustomToken(this.chat_auth, _.bind(function(error) {
                    if (error) {
                        console.log("Chisel Chat login failed!", error);
                    }
                    else {
                        console.log("Chisel Chat login successful!");

                        try {
                            this.chat.setUser({
                                userId: result.status.empire.id,
                                userName: result.chat_name,
                                isGuest: false, // for now
                                isModerator: result.isModerator,
                                isStaff: result.isStaff,
                                avatarUri: this.gravatar_url,
                                profileUri: this.gravatar_url
                            });
                        }
                        catch (err) {
                            console.log("cannot setUser " + err);
                        }
                        if (this.private_room) {
                            this.chat._chat.enterRoom(this.private_room.id, this.private_room.name);
                        }

                        // We're done.
                        this.hasRenderedChat = true;
                    }
                }, this));
            }, this),
            failure : function(o) {
                console.log("Chisel Chat init_chat failure.");
                return true;
            }
        });
    },
    render: function() {
        return (
            <div id="chiselchat-wrapper" ref="chatWrapper" style={{
                position: 'absolute',
                bottom: 0,
                width: '100vw',
                height: '25px',
                zIndex: 5000
            }}></div>
        );
    }
});

module.exports = Chat;
