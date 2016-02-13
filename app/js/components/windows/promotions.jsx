'use strict';

var React          = require('react');
var Reflux         = require('reflux');
var _              = require('lodash');

var ServerRPCStore = require('js/stores/rpc/server');

var Promotion = React.createClass({
    propTypes : {
        promotion : React.PropTypes.object.isRequired
    },

    getDefaultProps : function() {
        return {
            promotion : {}
        };
    },

    render : function() {
        return (
            <div className="text item">
                <h2>{this.props.promotion.header}</h2>

                {this.props.promotion.description}

                <br /><br />

                <span style={{
                    textDecoration : 'underline'
                }}>
                    Ends {this.props.promotion.ends}
                </span>
            </div>
        );
    }
});

var PromotionsWindow = React.createClass({
    mixins : [
        Reflux.connect(ServerRPCStore, 'server')
    ],

    statics : {
        windowOptions : {
            title  : 'Promotions',
            height : 'auto',
            width  : 300
        }
    },

    render : function() {
        return (
            <div className="ui vertical menu" style={{
                width : '100%'
            }}>
                {
                    _.map(this.state.server.promotions, function(promotion) {
                        return <Promotion promotion={promotion} />;
                    }, this)
                }
            </div>
        );
    }
});

module.exports = PromotionsWindow;
