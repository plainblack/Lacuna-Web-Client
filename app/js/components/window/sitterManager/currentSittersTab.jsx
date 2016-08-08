'use strict';

var React               = require('react');
var Reflux              = require('reflux');
var _                   = require('lodash');
var vex                 = require('js/vex');

var EmpireRPCActions    = require('js/actions/rpc/empire');

var SitterListItem      = require('js/components/window/sitterManager/sitterListItem');


var CurrentSittersTab = React.createClass({

    handleReauthorizeAll : function() {
        EmpireRPCActions.requestEmpireRPCAuthorizeSitters({ revalidate_all : true });
    },

    handleDeauthorizeAll : function() {
        vex.confirm(
            "Are you sure you want to revoke everyone's access to your empire?",
            _.partial(EmpireRPCActions.requestEmpireRPCDeauthorizeSitters, { deauthorize_all : true } )
        );
    },

    render : function() {
        return (
            <div>

                <div className="ui grid">
                    <div className="centered row">
                        <div className="ui large icon buttons">
                            <div className="ui green button" onClick={this.handleReauthorizeAll}>
                                <i className="refresh icon"></i>
                                Renew all
                            </div>
                            <div className="ui red button" onClick={this.handleDeauthorizeAll}>
                                <i className="warning sign icon"></i>
                                Revoke all
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="ui divided list"
                    style={{
                        marginTop : 20
                    }}
                >
                    {
                        _.map(this.props.sitters, function(sitter) {
                            return <SitterListItem key={sitter.id} sitter={sitter} />;
                        })
                    }
                </div>
            </div>
        );
    }
});

module.exports = CurrentSittersTab;
