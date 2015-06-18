'use strict';

var React = require('react');
var Reflux = require('reflux');

var classNames = require('classNames');

var LoaderStore = require('js/stores/menu/loader');

var Loader = React.createClass({
    mixins: [
        Reflux.connect(LoaderStore, 'show')
    ],
    getInitialState: function() {
        return {
            show: false
        };
    },
    render: function() {
        return (
            <div className={classNames(
                'ui large loader',
                {active: this.state.show}
            )} style={{zIndex: 9999999999, top: '40vh'}}>
            </div>
        );
    }
});

module.exports = Loader;

/*
{
// <div style={{
//     position: 'absolute',
//     margin: '0px auto',
//     textAlign: 'center',
//     top: '40vh',
//     zIndex: 9999999999,
//     backgroundColor: '#ffffff',
//     fontSize: '2em',
//     display: this.state.show ? '' : 'none'
// }}>
//     Loading...
// </div>
}

*/
