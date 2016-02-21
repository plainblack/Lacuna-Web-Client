'use strict';

var React = require('react');

var util  = require('js/util');

var SpyTrainingStatus = React.createClass({

    propTypes : {
        inTraining    : React.PropTypes.number.isRequired,
        pointsPerHour : React.PropTypes.number.isRequired,
        maxPoints     : React.PropTypes.number.isRequired
    },

    render : function() {
        return (
            <div className="ui teal labels">

                <div className="ui label">
                    Spies in training
                    <div className="detail">{this.props.inTraining}</div>
                </div>

                <div className="ui label">
                    Points / hr
                    <div className="detail">{this.props.pointsPerHour}</div>
                </div>

                <div className="ui label">
                    Points / hr / training spy
                    <div className="detail">
                        {
                            this.props.inTraining > 0
                                ? util.int(this.props.pointsPerHour / this.props.inTraining)
                                : 0
                        }
                    </div>
                </div>

                <div className="ui label">
                    Maximum points
                    <div className="detail">{this.props.maxPoints}</div>
                </div>
            </div>
        );
    }
});

module.exports = SpyTrainingStatus;
