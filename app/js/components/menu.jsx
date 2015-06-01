'use strict';

var React = require('react');

var TopBar = require('js/components/menu/topBar');
var BottomBar = require('js/components/menu/bottomBar');

var Menu = React.createClass({
    render: function() {
        return (
            <div>
                <TopBar />
                <BottomBar />
                <div idName="reactWindowContainer"></div>
            </div>
        );
    }
});

module.exports = Menu;
