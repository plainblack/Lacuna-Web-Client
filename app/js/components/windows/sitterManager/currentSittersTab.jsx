'use strict';

var React                       = require('react');
var Reflux                      = require('reflux');
var _                           = require('lodash');
var vex                         = require('js/vex');

var SitterManagerWindowActions  = require('js/actions/windows/sitterManager');

var SittersEmpireRPCStore       = require('js/stores/rpc/empire/sitters');

var SitterListItem              = require('js/components/windows/sitterManager/sitterListItem');


var CurrentSittersTab = React.createClass({
    mixins : [
        Reflux.connect(SittersEmpireRPCStore, 'sitters')
    ],

    reauthorizeAll : function() {
        SitterManagerWindowActions.reauthorizeAll();
    },

    deauthorizeAll : function() {
        vex.confirm(
            "Are you sure you want to revoke everyone's access to your empire?",
            SitterManagerWindowActions.deauthorizeAll
        );
    },

    render : function() {
        return (
            <div>

                <div className="ui grid">
                    <div className="centered row">
                        <div className="ui large icon buttons">
                            <div className="ui green button" onClick={this.reauthorizeAll}>
                                <i className="refresh icon"></i>
                                Renew all
                            </div>
                            <div className="ui red button" onClick={this.deauthorizeAll}>
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
                        _.map(this.state.sitters, function(sitter) {
                            return <SitterListItem key={sitter.id} sitter={sitter} />;
                        })
                    }
                </div>
            </div>
        );
    }
});

module.exports = CurrentSittersTab;
