'use strict';

var React                   = require('react');
var _                       = require('lodash');
var $                       = require('js/shims/jquery');

var EssentiaVeinRPCActions  = require('js/actions/rpc/essentiaVein');

var DrainTab = React.createClass({

    propTypes : {
        building : React.PropTypes.object.isRequired
    },

    componentDidMount : function() {
        $(this.refs.dropdown).dropdown();
    },

    handleDrain : function() {
        var times = parseInt($(this.refs.dropdown).dropdown('get value'), 10) / 30;
        var id = this.props.building.id;

        EssentiaVeinRPCActions.requestEssentiaVeinDrain(id, times);
    },

    render : function() {
        return (
            <div>
                Drain
                {' '}

                <div className="ui inline dropdown" ref="dropdown">
                    <div className="text">30 days</div>
                    <i className="dropdown icon"></i>
                    <div className="menu">
                        {
                            _.times(this.props.building.drain_capable, function(num) {
                                // Num starts on 0.
                                num += 1;

                                var days = num * 30;
                                var str = days + ' days';

                                return (
                                    <div className="item" data-text={str} key={days}>{days}</div>
                                );
                            })
                        }
                    </div>
                </div>

                <div className="ui green button" onClick={this.handleDrain}>
                    Drain
                </div>
            </div>
        );
    }
});

module.exports = DrainTab;
