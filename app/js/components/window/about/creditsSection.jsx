'use strict';

var React = require('react');
var _     = require('lodash');

var CreditsSection = React.createClass({

    propTypes : {
        header : React.PropTypes.string.isRequired,
        names  : React.PropTypes.arrayOf(React.PropTypes.string)
    },

    getDefaultProps : function() {
        return {
            header : '',
            names  : []
        };
    },

    render : function() {
        return (
            <div>
                <strong>{this.props.header}</strong>

                <ul>
                    {
                        _.map(this.props.names, function(name) {
                            return (
                                <li
                                    key={name}
                                    style={{
                                        listStyleType : 'disc',
                                        marginLeft    : 40
                                    }}
                                >
                                    {name}
                                </li>
                            );
                        })
                    }
                </ul>

                <br />
            </div>
        );
    }
});

module.exports = CreditsSection;
