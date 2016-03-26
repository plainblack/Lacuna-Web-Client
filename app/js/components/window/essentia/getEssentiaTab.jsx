'use strict';

var React               = require('react');
var _                   = require('lodash');

var EmpireRPCActions    = require('js/actions/rpc/empire');

var WindowActions       = require('js/actions/window');

var InviteWindow        = require('js/components/window/invite');

var GetEssentiaTab = React.createClass({

    purchase : function() {
        var url = '/pay?session_id=' + this.props.session;
        window.open(url, 'essentiaPayment', 'status=0,toolbar=0,location=0,menubar=0,resizable=1,scrollbars=1,height=550,width=600,directories=0');
    },

    redeem : function() {
        var node = this.refs.code;
        EmpireRPCActions.requestEmpireRPCRedeemEssentiaCode({ code : node.value });
        node.value = '';
    },

    invite : function() {
        WindowActions.windowAdd(InviteWindow, 'invite');
    },

    render : function() {
        return (
            <div style={{textAlign : 'center'}}>
                <div className="ui large green labeled icon button" onClick={this.purchase}>
                    <i className="payment icon"></i>
                    Purchase Essentia
                </div>

                <h3>OR</h3>

                <div className="ui large fluid action input">
                    <input type="text" placeholder="Essentia code" ref="code" />
                    <button className="ui blue button" onClick={this.redeem}>Redeem</button>
                </div>

                <h3>OR</h3>

                <p>
                    Invite your friends to the game and you get <strong>free Essentia!</strong> For
                    every university level past 4 that they achieve, you'll get 5 Essentia.
                    That's up to <u><strong>130 Essentia</strong></u> per friend!
                </p>

                <div className="ui large green labeled icon button" onClick={this.invite}>
                    <i className="add user icon"></i>
                    Invite a Friend
                </div>
            </div>
        );
    }
});

module.exports = GetEssentiaTab;
