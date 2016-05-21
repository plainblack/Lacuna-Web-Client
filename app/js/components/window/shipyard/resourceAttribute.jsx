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
        var title = this.props.attr;
        if ( ! window.isNaN(title)) {
            title = util.commify(title);
        }        
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

