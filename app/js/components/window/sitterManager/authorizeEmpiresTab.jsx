'use strict';

var React                = require('react');

var SitterManagerActions = require('js/actions/window/sitterManager');

var vex                  = require('js/vex');


var AuthorizeEmpiresTab = React.createClass({

    authorizeAllies: function() {
        vex.confirm({
            message: 'Are you sure you want to authorize all members of your alliance?',
            callback: function(value) {
                if (value) {
                    SitterManagerActions.authorizeAllies();
                }
            }
        });
    },

    authorizeAlliance: function() {
        var name = this.refs.alliance.getDOMNode().value;

        vex.confirm({
            message: 'Are you sure you want to authorize all members of ' + name + '?',
            callback: function(value) {
                if (value) {
                    SitterManagerActions.authorizeAlliance(name);
                }
            }
        });
    },

    authorizeEmpire: function() {
        var name = this.refs.empire.getDOMNode().value;

        vex.confirm({
            message: 'Are you sure you want to authorize ' + name + '?',
            callback: function(value) {
                if (value) {
                    SitterManagerActions.authorizeEmpire(name);
                }
            }
        });
    },

    render: function() {
        return (
            <div style={{textAlign: 'center'}}>
                <div
                    className="ui green large labeled icon button"
                    onClick={this.authorizeAllies}
                >
                    <i className="warning sign icon"></i>
                    Authorize all Empires in current alliance
                </div>

                <h3>OR</h3>

                <div className="ui large fluid action input">
                    <input type="text" placeholder="Alliance name" ref="alliance" />
                    <div className="ui green button" onClick={this.authorizeAlliance}>
                        Authorize
                    </div>
                </div>

                <h3>OR</h3>

                <div className="ui large fluid action input">
                    <input type="text" placeholder="Empire name" ref="empire" />
                    <div className="ui green button" onClick={this.authorizeEmpire}>
                        Authorize
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = AuthorizeEmpiresTab;
