'use strict';

var React = require('react');
var Reflux = require('reflux');
var $ = require('js/hacks/jquery');

var EmpireStore = require('js/stores/empire');

var CenterBar = require('js/components/mixin/centerBar');

var UserActions = require('js/actions/user');
var MapActions = require('js/actions/menu/map');

var MailActions = require('js/actions/window/mail');
var EssentiaActions = require('js/actions/window/essentia');
var StatsActions = require('js/actions/window/stats');

var TopBar = React.createClass({
    mixins: [
        Reflux.connect(EmpireStore, 'empire'),
        CenterBar('bar')
    ],
    componentDidUpdate: function() {
        // Activate the popups.
        $('a', this.refs.bar.getDOMNode()).popup({
            variation: 'inverted'
        });
    },
    componentWillUnmount: function() {
        // Destroy!
        $('a', this.refs.bar.getDOMNode()).popup('destroy');
    },
    render: function() {
        return (
            <div className="ui blue inverted menu" ref="bar" style={{
                position: 'fixed',
                margin: 0,
                zIndex: 2000,
                width: 'auto',
                height: 'auto',
                display: 'inline-block',
                top: '15px'
            }}>
                <a className="item" data-content="Star Map" onClick={MapActions.toggleMapMode}>
                    <i className="map big icon"></i>
                </a>
                <a className="item" data-content="Mail" onClick={MailActions.show}>
                    <i className="mail big icon"></i>
                    {
                        this.state.empire.has_new_messages > 0
                            ?
                                <div className="ui yellow circular label">
                                    {this.state.empire.has_new_messages}
                                </div>
                            :
                                ''
                    }
                </a>
                <a className="item" data-content="Essentia" onClick={EssentiaActions.show}>
                    <i className="money big icon"></i>
                    <div className="ui teal floated right circular label">
                        {parseInt(this.state.empire.essentia, 10)}
                    </div>
                </a>
                <a className="item" data-content="Universe Rankings" onClick={StatsActions.show}>
                    <i className="find big icon"></i>
                </a>
                <a className="item" data-content="Sign Out" onClick={UserActions.signOut}>
                    <i className="power big icon"></i>
                </a>
            </div>
        );
    }
});

module.exports = TopBar;
