'use strict';

var React = require('react');
var Reflux = require('reflux');

var TopBar = require('js/components/menu/topBar');
var BottomBar = require('js/components/menu/bottomBar');

var LeftSidebarButton = require('js/components/menu/leftSidebarButton');
var RightSidebarButton = require('js/components/menu/rightSidebarButton');

var Chat = require('js/components/menu/chat');
var RPCCount = require('js/components/menu/rpcCount');

var Loader = require('js/components/menu/loader');

var MenuStore = require('js/stores/menu');

var Menu = React.createClass({
    mixins: [
        Reflux.connect(MenuStore, 'show')
    ],
    getInitialState: function() {
        return {
            show: false
        };
    },
    render: function() {
        if (this.state.show) {
            return (
                <div>
                    <LeftSidebarButton />
                    <RightSidebarButton />
                    <TopBar />

                    { /* More stuff for integrating with React */ }
                    <div id="oldYUIPanelContainer"></div>

                    <Loader />
                    <RPCCount />

                    <BottomBar />

                    { /* Chat, yay! */ }
                    <Chat />
                </div>
            );
        } else {
            return <div></div>;
        }
    }
});

module.exports = Menu;
