'use strict';

var React               = require('react');
var _                   = require('lodash');

var EmpireRPCActions    = require('js/actions/rpc/empire');

var vex                 = require('js/vex');

var SitterListItem = React.createClass({

    propTypes : {
        sitter : React.PropTypes.object
    },

    getDefaultProps : function() {
        return {
            sitter : {}
        };
    },

    handleReauthorize : function() {
        EmpireRPCActions.requestEmpireRPCAuthorizeSitters({ empires : [this.props.sitter.name] });
    },

    handleDeauthorize : function() {
        var s = this.props.sitter;

        vex.confirm(
            'Are you sure you want to remove ' + s.name + "'s access to your empire?",
            _.partial(EmpireRPCActions.requestEmpireRPCDeauthorizeSitters, { empires : [s.id] })
        );
    },

    render : function() {
        return (
            <div className="item">
                <div className="ui right floated compact buttons">
                    <div className="ui green button" onClick={this.handleReauthorize}>
                        Renew
                    </div>
                    <div className="ui red button" onClick={this.handleDeauthorize}>
                        Revoke
                    </div>
                </div>

                <div className="content aligned">
                    <div className="header" style={{color : '#ffffff'}}>
                        {this.props.sitter.name}
                    </div>

                    Expires {this.props.sitter.ends}
                </div>
            </div>
        );
    }
});

module.exports = SitterListItem;
