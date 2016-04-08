'use strict';

var React       = require('react');
var classnames  = require('classnames');

var util        = require('js/util');

var ResourceAttribute = React.createClass({

    propTypes : {
        name    : React.PropTypes.string.isRequired,
        attr    : React.PropTypes.number.isRequired
    },

    render : function() {
        var title       = util.commify(this.props.attr);
        
        return (
            <div style={{
                marginTop : 5
            }}>
                <span>{this.props.name}</span>
                <span
                    style={{
                      float : 'right',
                    }}
                    title={title}
                >{title}
                </span>
            </div>
        );
    }
});

module.exports = ResourceAttribute;

