'use strict';

var React                = require('react');
var _                    = require('lodash');

var SitterManagerActions = require('js/actions/windows/sitterManager');

var vex                  = require('js/vex');

var SitterListItem = React.createClass({

    propTypes : {
        sitter : React.PropTypes.object
    },

    getDefaultProps : function() {
        return {
            sitter : {}
        };
    },

    reauthorize : function() {
        SitterManagerActions.authorizeEmpire(this.props.sitter.name);
    },

    deauthorize : function() {
        var s = this.props.sitter;

        vex.confirm(
            'Are you sure you want to remove ' + s.name + "'s access to your empire?",
            _.partial(SitterManagerActions.deauthorizeEmpire, s.id)
        );
    },

    render : function() {
        return (
            <div className="item">
                <div className="ui right floated compact buttons">
                    <div className="ui green button" onClick={this.reauthorize}>
                        Renew
                    </div>
                    <div className="ui red button" onClick={this.deauthorize}>
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
