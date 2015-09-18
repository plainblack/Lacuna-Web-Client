'use strict';

var React = require('react');

var LeftSidebarActions = require('js/actions/menu/leftSidebar');

var AboutActions = require('js/actions/window/about');
var InviteActions = require('js/actions/window/invite');
var NotesActions = require('js/actions/window/notes');
var OptionsActions = require('js/actions/window/options');
var ServerClockActions = require('js/actions/window/serverClock');

var toggle = function(callback) {
    return function() {
        LeftSidebarActions.toggle();
        callback();
    };
}

var LeftSidebar = React.createClass({
    render: function() {
        return (
            <div className="ui left vertical inverted sidebar menu">

                <div className="ui horizontal inverted divider">
                    Links
                </div>

                <a className="item" target="_blank" href="/starmap/"
                    onClick={LeftSidebarActions.toggle}>
                    <i className="map icon"></i>
                    Alliance Map
                </a>
                <a className="item" target="_blank" href="/changes.txt"
                    onClick={LeftSidebarActions.toggle}>
                    <i className="code icon"></i>
                    Changes Log
                </a>
                <a className="item" target="_blank"
                    href="http://community.lacunaexpanse.com/forums"
                    onClick={LeftSidebarActions.toggle}>
                    <i className="comments layout icon"></i>
                    Forums
                </a>
                <a className="item" target="_blank" href="http://www.lacunaexpanse.com/help/"
                    onClick={LeftSidebarActions.toggle}>
                    <i className="student icon"></i>
                    Help
                </a>
                <a className="item" onClick={toggle(ServerClockActions.show)}>
                    <i className="wait icon"></i>
                    Server Clock
                </a>
                <a className="item" target="_blank" href="http://www.lacunaexpanse.com/terms/"
                    onClick={LeftSidebarActions.toggle}>
                    <i className="info circle icon"></i>
                    Terms of Service
                </a>
                <a className="item" target="_blank" href="http://lacunaexpanse.com/tutorial/"
                    onClick={LeftSidebarActions.toggle}>
                    <i className="marker icon"></i>
                    Tutorial
                </a>
                <a className="item" target="_blank" href="http://community.lacunaexpanse.com/wiki"
                    onClick={LeftSidebarActions.toggle}>
                    <i className="share alternate icon"></i>
                    Wiki
                </a>

                <div className="ui horizontal inverted divider">
                    Actions
                </div>

                <a className="item" onClick={toggle(AboutActions.show)}>
                    <i className="rocket icon"></i>
                    About
                </a>
                <a className="item" onClick={toggle(InviteActions.show)}>
                    <i className="add user icon"></i>
                    Invite a Friend
                </a>
                <a className="item" onClick={toggle(OptionsActions.show)}>
                    <i className="options icon"></i>
                    Options
                </a>
                <a className="item" onClick={toggle(function() {
                    YAHOO.lacuna.MapPlanet.Refresh();
                })}>
                    <i className="refresh icon"></i>
                    Refresh
                </a>

            </div>
        );
    }
});

//                <a className="item" onClick={toggle(NotesActions.show)}>
//                    <i className="edit icon"></i>
//                    Notes
//                </a>


module.exports = LeftSidebar;
