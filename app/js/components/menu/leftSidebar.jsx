'use strict';

var React               = require('react');
var Reflux              = require('reflux');
var util                = require('js/util');
var server              = require('js/server');
var $                   = require('js/shims/jquery');
var windowTypes         = require('js/windowTypes');

var LeftSidebarActions  = require('js/actions/menu/leftSidebar');
var AboutActions        = require('js/actions/window/about');
var NotesActions        = require('js/actions/window/notes');
var OptionsActions      = require('js/actions/window/options');
var WindowManagerActions = require('js/actions/menu/windowManager');

var windowTypes         = require('js/windowTypes');
var RpcBodyActions      = require('js/actions/rpc/body');

var EmpireRPCStore      = require('js/stores/rpc/empire');
var LeftSidebarStore    = require('js/stores/menu/leftSidebar');

var LeftSidebarStore 	= require('js/stores/menu/leftSidebar');
var windowTypes         = require('js/windowTypes');

// Because there's a bit of special logic going on here, this is in a separate component.
var SelfDestruct = React.createClass({

    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire')
    ],

    render: function() {
        var destructActive      = this.state.empire.self_destruct_active
            && this.state.empire.self_destruct_ms > 0;
        var destructMs          = this.state.empire.self_destruct_ms;
        var formattedDestructMs = destructActive ? util.formatMillisecondTime(destructMs) : '';

        var itemStyle   = destructActive ? {'color':'red'} : {};
        var verb        = destructActive ? 'Disable' : 'Enable';

        return (
            <a
                className="item"
                style={itemStyle}
                onClick={function() {
                    LeftSidebarActions.hide();
                    this.onClickSelfDestruct();
                }}
            >
                <i className="bomb icon"></i>
                {verb} Self Destruct {
                    destructActive ?
                        <span>
                            <p style={{margin:0}}>SELF DESTRUCT ACTIVE</p>
                            <p style={{textAlign: 'right !important'}}>{ formattedDestructMs }</p>
                        </span>
                    :
                        ''
                }
            </a>
        );
    },

    onClickSelfDestruct : function() {
        var method = '';
        if (this.state.empire.self_destruct_active === 1) {
            method = 'disable_self_destruct';
        } else if (this.confirmSelfDestruct()) {
            method = 'enable_self_destruct';
        } else {
            return;
        }

        server.call({
            module: 'empire',
            method: method,
            params: [],
            scope: this,
            success: function() {
                if (method === 'enable_self_destruct') {
                    alert('Success - your empire will be deleted in 24 hours.');
                } else {
                    alert('Success - your empire will not be deleted. Phew!');
                }
            }
        });
    },

    confirmSelfDestruct: function() {
        return confirm('Are you ABSOLUTELY sure you want to enable self destuct?  If enabled, your empire will be deleted after 24 hours.');
    }
});

var LeftSidebar = React.createClass({
    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire'),
        Reflux.connect(LeftSidebarStore, 'leftSidebar')
    ],

    componentDidMount: function() {
        var el = this.refs.sidebar.getDOMNode();

        $(el)
            .sidebar({
                context: $('#sidebarContainer'),
                duration: 300,
                transition: 'overlay',
                onHidden: LeftSidebarActions.hide,
                onVisible: LeftSidebarActions.show
            });
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (prevState.leftSidebar !== this.state.leftSidebar) {
            this.handleSidebarShowing();
        }
    },

    handleSidebarShowing: function() {
        var el = this.refs.sidebar.getDOMNode();

        $(el)
            .sidebar(this.state.leftSidebar ? 'show' : 'hide');
    },

    render: function() {

        return (
            <div className="ui left vertical inverted sidebar menu" ref="sidebar">

                <div className="ui horizontal inverted divider">
                    Actions
                </div>

                <a className="item" onClick={function() {
                    LeftSidebarActions.hide();
                    WindowManagerActions.addWindow(windowTypes.invite);
                }}>
                    <i className="add user icon"></i>
                    Invite a Friend
                </a>
                <a className="item" onClick={function() {
                    LeftSidebarActions.hide();
                    YAHOO.lacuna.MapPlanet.Refresh();
                }}>
                    <i className="refresh icon"></i>
                    Refresh
                </a>



                <div className="ui horizontal inverted divider">
                    Links
                </div>

                <a className="item" target="_blank" href="/starmap/"
                    onClick={LeftSidebarActions.hide}
                >
                    <i className="map icon"></i>
                    Alliance Map
                </a>
                <a className="item" target="_blank" href="/changes.txt"
                    onClick={LeftSidebarActions.hide}
                >
                    <i className="code icon"></i>
                    Changes Log
                </a>
                <a className="item" target="_blank"
                    href="http://community.lacunaexpanse.com/forums"
                    onClick={LeftSidebarActions.hide}
                >
                    <i className="comments layout icon"></i>
                    Forums
                </a>
                <a className="item" target="_blank" href="http://www.lacunaexpanse.com/help/"
                    onClick={LeftSidebarActions.hide}
                >
                    <i className="student icon"></i>
                    Help
                </a>
                <a className="item" target="_blank" href="http://www.lacunaexpanse.com/terms/"
                    onClick={LeftSidebarActions.hide}
                >
                    <i className="info circle icon"></i>
                    Terms of Service
                </a>
                <a className="item" target="_blank" href="http://lacunaexpanse.com/tutorial/"
                    onClick={LeftSidebarActions.hide}
                >
                    <i className="marker icon"></i>
                    Tutorial
                </a>
                <a className="item" target="_blank" href="http://community.lacunaexpanse.com/wiki"
                    onClick={LeftSidebarActions.hide}
                >
                    <i className="share alternate icon"></i>
                    Wiki
                </a>



                <div className="ui horizontal inverted divider">
                    Windows
                </div>

                <a className="item" onClick={function() {
                        LeftSidebarActions.hide();
                    WindowManagerActions.addWindow(windowTypes.about);
                }}>
                    <i className="rocket icon"></i>
                    About
                </a>
                <a className="item" onClick={function() {
                        LeftSidebarActions.hide();
                        WindowManagerActions.addWindow(windowTypes.sitterManager);
                    }}
                >
                    <i className="sitemap icon"></i>
                    Manage Sitters
                </a>
                <a className="item" onClick={function() {
                        LeftSidebarActions.hide();
                        OptionsActions.show();
                    }}
                >
                    <i className="options icon"></i>
                    Options
                </a>
                <a className="item" onClick={function() {
                    LeftSidebarActions.hide();
                    WindowManagerActions.addWindow(windowTypes.serverClock);
                }}>
                    <i className="wait icon"></i>
                    Server Clock
                </a>

                <div className="ui horizontal inverted divider">
                    Self Destruct
                </div>

                <SelfDestruct />
            </div>
        );
    },

    onClickSelfDestruct : function() {
        var Game = YAHOO.lacuna.Game;
        var EmpireServ = Game.Services.Empire;
        var func;
        if(this.state.empire.self_destruct_active === 1) {
            func = EmpireServ.disable_self_destruct;
        }
        else if (confirm("Are you certain you want to enable self destuct?  If enabled, your empire will be deleted after 24 hours.")) {
            func = EmpireServ.enable_self_destruct;
        }
        else {
            return;
        }
        require('js/actions/menu/loader').show();
        func({session_id:Game.GetSession()}, {
            success : function(o) {
                Game.ProcessStatus(o.result.status);
                require('js/actions/menu/loader').hide();
            }
        });

        LeftSidebarActions.hide();
    },
});


module.exports = LeftSidebar;
