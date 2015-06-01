'use strict';

var React = require('react');
var Reflux = require('reflux');

var EmpireStore = require('js/stores/empire');

var CenterBar = require('js/components/mixins/centerBar');

var TopBar = React.createClass({
    mixins: [
        Reflux.connect(EmpireStore, 'empire'),
        CenterBar('bar')
    ],
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
                <a className="item" data-content="Star Map">
                    <i className="map big icon"></i>
                </a>
                <a className="item" data-content="Mail">
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
                <a className="item" data-content="Essentia">
                    <i className="money big icon"></i>
                    <div className="ui teal floated right circular label">
                        {parseInt(this.state.empire.essentia, 10)}
                    </div>
                </a>
                <a className="item" data-content="Universe Rankings">
                    <i className="find big icon"></i>
                </a>
                <a className="item" data-content="Sign Out">
                    <i className="power big icon"></i>
                </a>
            </div>
        );
    }
});

module.exports = TopBar;
