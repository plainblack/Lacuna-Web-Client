'use strict';

var React       = require('react');
var Reflux      = require('reflux');

var classNames  = require('classnames');

var LoaderMenuStore = require('js/stores/menu/loader');

var Loader = React.createClass({
    mixins : [
        Reflux.connect(LoaderMenuStore, 'loader')
    ],
    render : function() {
        return (
            <div
                className={classNames(
                    'ui large loader',
                    {
                        active : this.state.loader.show
                    }
                )}
                style={{
                    zIndex : 9999999999,
                    top    : '40vh'
                }}>
            </div>
        );
    }
});

module.exports = Loader;
