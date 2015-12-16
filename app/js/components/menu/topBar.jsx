'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var EmpireRPCStore = require('js/stores/rpc/empire');
var MapModeStore = require('js/stores/menu/mapMode');
var ServerRPCStore = require('js/stores/rpc/server');

var centerBar = require('js/components/mixin/centerBar');
var classNames = require('classnames');

var UserActions = require('js/actions/user');
var MapActions = require('js/actions/menu/map');

var MailActions = require('js/actions/window/mail');
var EssentiaActions = require('js/actions/window/essentia');
var PromotionsActions = require('js/actions/window/promotions');
var StatsActions = require('js/actions/window/stats');

var TopBar = React.createClass({
    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire'),
        Reflux.connect(ServerRPCStore, 'server'),
        Reflux.connect(MapModeStore, 'mapMode'),
        centerBar('bar')
    ],

    mapButtonTip: function() {
        if (this.state.mapMode === MapModeStore.PLANET_MAP_MODE) {
            return 'To Star Map';
        } else {
            return 'To Planet Map';
        }
    },

    render: function() {
        var barClass = classNames('ui inverted menu', {
            red: this.state.empire.self_destruct_active,
            blue: !this.state.empire.self_destruct_active
        });

        return (
            <div className={barClass} ref="bar" style={{
                position: 'fixed',
                margin: 0,
                zIndex: 2000,
                width: 'auto',
                height: 'auto',
                display: 'inline-block',
                top: '15px'
            }}>

                <a className="item" data-tip={this.mapButtonTip()}
                    onClick={MapActions.toggleMapMode}>
                    <i className="map big icon"></i>
                </a>

                <a className="item" data-tip="Mail" onClick={MailActions.show}>
                    <i className="mail big icon"></i>
                    {
                        this.state.empire.has_new_messages > 0
                            ?
                                <div className="ui yellow circular label">
                                    {this.state.empire.has_new_messages}
                                </div>
                            :
                                ''
                    }
                </a>

                <a className="item" data-tip="Essentia" onClick={EssentiaActions.show}>
                    <i className="money big icon"></i>
                    <div className="ui teal floated right circular label">
                        {this.state.empire.essentia}
                    </div>
                </a>

                <a className="item" data-tip="Universe Rankings" onClick={StatsActions.show}>
                    <i className="find big icon"></i>
                </a>

                {
                    this.state.server.promotions.length > 0
                    ?
                        <a
                            className="item"
                            data-tip={
                                this.state.server.promotions.length > 1
                                ? 'Active Promotions'
                                : 'Active Promotion'
                            }
                            onClick={PromotionsActions.show}
                        >
                            <i className="announcement big icon"></i>
                            <div className="ui orange floated right circular label">
                                Event!
                            </div>
                        </a>
                    :
                        ''
                }

                <a className="item" data-tip="Sign Out" onClick={UserActions.signOut}>
                    <i className="power big icon"></i>
                </a>
            </div>
        );
    }
});

module.exports = TopBar;
