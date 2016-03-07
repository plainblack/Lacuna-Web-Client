'use strict';

var React                = require('react');
var Reflux               = require('reflux');

var EmpireRPCStore       = require('js/stores/rpc/empire');
var MapModeStore         = require('js/stores/menu/mapMode');
var ServerRPCStore       = require('js/stores/rpc/server');

var classNames           = require('classnames');

var RpcEmpireActions     = require('js/actions/rpc/empire');

var MapActions           = require('js/actions/menu/map');

var WindowManagerActions = require('js/actions/windowManager');
var windowTypes          = require('js/windowTypes');

var MailActions          = require('js/actions/windows/mail');
var StatsActions         = require('js/actions/windows/stats');

var TopBar = React.createClass({
    mixins : [
        Reflux.connect(EmpireRPCStore, 'empire'),
        Reflux.connect(ServerRPCStore, 'server'),
        Reflux.connect(MapModeStore, 'mapMode')
    ],

    mapButtonTip : function() {
        if (this.state.mapMode === MapModeStore.PLANET_MAP_MODE) {
            return 'To Star Map';
        } else {
            return 'To Planet Map';
        }
    },

    render : function() {
        var barClass = classNames('ui inverted compact small menu', {
            red  : this.state.empire.self_destruct_active,
            blue : !this.state.empire.self_destruct_active
        });

        return (
            <div
                className="ui centered grid"
                style={{
                    zIndex   : 2000,
                    position : 'relative',
                    top      : 15
                }}
            >
                <div className="center aligned column">
                    <div
                        className={barClass}
                        ref="bar"
                    >

                        <a className="item" data-tip={this.mapButtonTip()}
                            onClick={MapActions.mapToggleMode}>
                            <i className="map big icon"></i>
                        </a>

                        <a className="item" data-tip="Mail" onClick={MailActions.show}>
                            <i className="mail big icon"></i>
                            {
                                this.state.empire.has_new_messages > 0
                                ? (
                                    <div className="ui yellow label">
                                        {this.state.empire.has_new_messages}
                                    </div>
                                ) : ''
                            }
                        </a>

                        <a className="item" data-tip="Essentia" onClick={function() {
                            WindowManagerActions.addWindow(windowTypes.essentia);
                        }}>
                            <i className="money big icon"></i>
                            <div className="ui teal label">
                                {this.state.empire.essentia}
                            </div>
                        </a>

                        <a className="item" data-tip="Universe Rankings" onClick={StatsActions.show}>
                            <i className="find big icon"></i>
                        </a>

                        {
                            this.state.server.promotions.length > 0
                            ? (
                                <a
                                    className="item"
                                    data-tip={
                                        this.state.server.promotions.length > 1
                                        ? 'Active Promotions'
                                        : 'Active Promotion'
                                    }
                                    onClick={function() {
                                        WindowManagerActions.addWindow(windowTypes.promotions);
                                    }}
                                    >
                                    <i className="announcement big icon"></i>
                                    <div className="ui orange floated right circular label">
                                        Event!
                                    </div>
                                </a>
                            ) : ''
                        }

                        <a className="item" data-tip="Sign Out" onClick={RpcEmpireActions.requestRpcEmpireLogout}>
                            <i className="power big icon"></i>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = TopBar;
