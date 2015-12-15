'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var moment = require('moment');

var util = require('js/util');

var PromotionsActions = require('js/actions/window/promotions');

var ServerRPCStore = require('js/stores/rpc/server');
var PromotionsWindowStore = require('js/stores/window/promotions');

var Panel = require('js/components/panel');

var Promotion = React.createClass({
    propTypes: {
        promotion: React.PropTypes.object.isRequired
    },

    getDefaultProps: function() {
        return {
            promotion: {}
        };
    },

    promotionTypes: {
        Bonus50: '50% Bonus'
    },

    getHeader: function() {
        return this.promotionTypes[this.props.promotion.type] || 'Awesome Promotion';
    },

    getEnd: function() {
        return moment().to(util.serverDateToMoment(this.props.promotion.end_date));
    },

    render: function() {
        return (
            <div className="text item">
                <h2>{this.getHeader()}</h2>

                {this.props.promotion.description}

                <br /><br />

                <span style={{
                    textDecoration: 'underline'
                }}>
                    Ends {this.getEnd()}
                </span>
            </div>
        );
    }
});

var PromotionsWindow = React.createClass({
    mixins: [
        Reflux.connect(ServerRPCStore, 'server'),
        Reflux.connect(PromotionsWindowStore, 'show')
    ],

    render: function() {
        return (
            <Panel
                show={this.state.show}
                onClose={PromotionsActions.hide}
                height={300}
                width={300}
                title="Promotions"
            >
                <div className="ui vertical menu" style={{
                    width: '100%'
                }}>
                    {
                        _.map(this.state.server.promotions, function(promotion) {
                            return <Promotion promotion={promotion} />;
                        }, this)
                    }
                </div>
            </Panel>
        );
    }
});

module.exports = PromotionsWindow;
